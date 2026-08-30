/**
 * TX-BLOCK — generator core for Texas Principles of Real Estate I, mirroring the spirit of
 * scripts/lib/generate-ca-block-maps.mjs (screen ranges derived from a frozen lesson's own
 * headings, never copied text) but built against Texas's real module shape, which is NOT
 * California's fixed six-section/eight-problem template:
 *
 *   ## TREC Topic: <title>              (front matter — prescribed minutes, objectives prose,
 *                                         the module's statute-grounding note; dropped, like the
 *                                         H1, from the generated screens)
 *   ## Unit: <title>                    (repeats 2-10 times per module; this is the natural block
 *                                         unit — Texas's own PRINS1-1 course-approval form already
 *                                         names each one, e.g. T01U1, and principles-i-course.mjs
 *                                         already carries a hand-authored learning objective for
 *                                         every one of the 46 units, which this generator reuses
 *                                         rather than re-deriving)
 *   ### Statute reading exercise: ...   (0+ per unit, always trailing that unit's teaching prose)
 *   ### Applied exercise: ...           (0+ per unit, same position)
 *   ## Module recap                    (closes the module; becomes its own single-screen block)
 *
 * One block per unit (id = the unit's own PRINS1-1 code, lowercased — "t01u1"), one trailing
 * recap block per module. Retrieval banks are NOT generated here: they come from
 * config/texas/principles-i-block-retrieval.mjs, itself adapted from the existing formative
 * question bank (config/texas/principles-i-question-bank.mjs) plus newly authored items for the
 * units that bank doesn't yet cover — see scripts/build-tx-retrieval-bank.mjs.
 */

import fs from "node:fs";

const q = (value) => JSON.stringify(String(value));

/** unitCodesInOrder: e.g. ["T01U1","T01U2","T01U3","T01U4"] for module 01, in file order. */
export function parseModule(markdown, unitCodesInOrder) {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const marks = []; // { kind: "unit"|"exercise"|"recap", heading, lineIndex, title }
  lines.forEach((line, index) => {
    const unit = line.match(/^## Unit: (.+)$/);
    if (unit) { marks.push({ kind: "unit", heading: line.trim(), lineIndex: index, title: unit[1].trim() }); return; }
    const recap = line.match(/^### Module recap\s*$/);
    if (recap) { marks.push({ kind: "recap", heading: line.trim(), lineIndex: index, title: "Module recap" }); return; }
    const optional = line.match(/^## Optional reference: (.+)$/);
    if (optional) { marks.push({ kind: "optional", heading: line.trim(), lineIndex: index, title: optional[1].trim() }); return; }
    const exercise = line.match(/^### (Statute reading exercise|Applied exercise): (.+)$/);
    if (exercise) { marks.push({ kind: "exercise", heading: line.trim(), lineIndex: index, title: `${exercise[1]}: ${exercise[2].trim()}` }); return; }
  });

  const units = marks.filter((m) => m.kind === "unit");
  if (units.length !== unitCodesInOrder.length) {
    throw new Error(`module: found ${units.length} "## Unit:" headings, expected ${unitCodesInOrder.length} (${unitCodesInOrder.join(",")})`);
  }
  const recapMark = marks.find((m) => m.kind === "recap");
  if (!recapMark) throw new Error("module: no \"### Module recap\" heading found");
  /* A module may close with one "## Optional reference:" section. It is not required work: the
     student may skip it, no assessment item may depend on it, and its minutes are excluded from
     required time. It becomes its own trailing block with required:false rather than being folded
     into the recap — and the recap's range has to STOP at it, or the recap screen would silently
     carry optional material as required review. */
  const optionalMark = marks.find((m) => m.kind === "optional");

  const blocks = [];
  units.forEach((unitMark, index) => {
    const code = unitCodesInOrder[index];
    const nextBoundary = units[index + 1] ?? recapMark;
    const exercisesInRange = marks.filter(
      (m) => m.kind === "exercise" && m.lineIndex > unitMark.lineIndex && m.lineIndex < nextBoundary.lineIndex
        && (!optionalMark || m.lineIndex < optionalMark.lineIndex),
    );
    const screens = [];
    const instructionTo = exercisesInRange.length ? exercisesInRange[0].heading : nextBoundary.heading;
    /* The first unit's first screen also absorbs the module's front matter ("## TREC Topic:" —
       prescribed time, the module-level objectives prose, the statute-grounding note) and the
       bare H1, exactly as the Mortgage/Principles/Practice California blocks absorb their
       lesson's front matter into Block 1's first screen rather than dropping it. */
    const instructionFrom = index === 0 ? "^" : unitMark.heading;
    screens.push({ type: "instruction", title: unitMark.title, from: instructionFrom, to: instructionTo });
    exercisesInRange.forEach((exercise, exIndex) => {
      const to = exercisesInRange[exIndex + 1] ? exercisesInRange[exIndex + 1].heading : nextBoundary.heading;
      screens.push({ type: "practice", title: exercise.title, from: exercise.heading, to });
    });
    screens.push({ type: "retrieval", title: "Retrieval check", questionId: `${code.toLowerCase()}-q1` });
    blocks.push({ id: code.toLowerCase(), code, title: unitMark.title, screens });
  });

  return { blocks, recapMark, optionalMark };
}

/**
 * course: {
 *   root, curriculumDir,
 *   courseId: "tx-principles-real-estate-i-30-v1",
 *   moduleNumber: 1..9,
 *   unitCodes: ["T01U1", ...],           // this module's units, in file order
 *   unitObjectives: { T01U1: "...", ... }, // from config/texas/principles-i-course.mjs UNIT_OBJECTIVES
 *   outFile: (moduleNumber) => path,
 * }
 */
export function generateModuleBlocks(course, moduleNumber) {
  const nn = String(moduleNumber).padStart(2, "0");
  const lessonPath = `${course.curriculumDir}/module-${nn}.md`;
  const markdown = fs.readFileSync(lessonPath, "utf8");
  const { blocks, recapMark, optionalMark } = parseModule(markdown, course.unitCodes);

  for (const block of blocks) {
    const objective = course.unitObjectives[block.code];
    if (!objective) throw new Error(`module ${nn}: no learning objective for unit ${block.code}`);
  }

  const renderScreen = (blockId, screen, index) => {
    const id = `${blockId}-s${index + 1}`;
    if (screen.type === "retrieval") {
      return `        { id: ${q(id)}, sequence: ${index + 1}, type: "retrieval", title: ${q(screen.title)}, questionId: ${q(screen.questionId)} },`;
    }
    return `        { id: ${q(id)}, sequence: ${index + 1}, type: ${q(screen.type)}, title: ${q(screen.title)}, content: RANGE(${q(screen.from)}, ${q(screen.to)}) },`;
  };

  const rendered = blocks.map((block, blockIndex) => `    {
      id: ${q(block.id)}, sequence: ${blockIndex + 1}, required: true,
      code: ${q(block.code)},
      title: ${q(block.title)},
      learningObjective: ${q(course.unitObjectives[block.code])},
      screens: [
${block.screens.map((screen, index) => renderScreen(block.id, screen, index)).join("\n")}
      ],
    },`).join("\n");

  const recapBlockId = `t${moduleNumber}-recap`;
  const recapBlock = `    {
      id: ${q(recapBlockId)}, sequence: ${blocks.length + 1}, required: true,
      title: "Module recap",
      screens: [
        { id: ${q(`${recapBlockId}-s1`)}, sequence: 1, type: "review", title: "Module recap", content: RANGE(${q(recapMark.heading)}, ${q(optionalMark ? optionalMark.heading : "$")}) },
      ],
    },`;

  /* required:false is load-bearing, not decorative. The engine must not gate progression on this
     block, no quiz or examination item may be traced to it, and the time evidence counts its words
     under optional rather than required. */
  const optionalBlockId = `t${moduleNumber}-optional`;
  const optionalBlock = optionalMark ? `
    {
      id: ${q(optionalBlockId)}, sequence: ${blocks.length + 2}, required: false, optional: true,
      title: ${q(optionalMark.title)},
      nonBlocking: true,
      excludedFromRequiredTime: true,
      noAssessmentMayDependOnThis: true,
      screens: [
        { id: ${q(`${optionalBlockId}-s1`)}, sequence: 1, type: "optional-reference", title: ${q(optionalMark.title)}, content: RANGE(${q(optionalMark.heading)}, "$") },
      ],
    },` : "";

  const body = `/**
 * GENERATED FILE — Texas Principles of Real Estate I, Module ${nn} learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-principles-block-maps.mjs.
 * Learning objectives come from config/texas/principles-i-course.mjs's UNIT_OBJECTIVES (already
 * hand-authored, traced to read statute sections); the retrieval bank lives in
 * config/texas/principles-i-block-retrieval.mjs. Do not edit by hand — regenerate.
 */

const RANGE = (from, to) => Object.freeze({ from, to });

export const MODULE_${moduleNumber}_BLOCKS = Object.freeze({
  courseId: ${q(course.courseId)},
  moduleId: ${q(`module-${nn}`)},
  version: "1.0",
  contentPath: ${q(`/content/texas/${course.courseId}/module-${nn}.md`)},
  blocks: [
${rendered}
${recapBlock}${optionalBlock}
  ],
});

export default MODULE_${moduleNumber}_BLOCKS;
`;
  fs.writeFileSync(course.outFile(moduleNumber), body);
  return course.outFile(moduleNumber);
}
