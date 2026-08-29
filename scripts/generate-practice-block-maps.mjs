/**
 * CA-BLOCK — generate learning-block maps for Real Estate Practice.
 * Thin per-course config wrapper over the shared generator core in scripts/lib/generate-ca-block-maps.mjs
 * (see scripts/generate-mortgage-block-maps.mjs for the full design notes — identical logic, this
 * course's own curriculum directory, spec module, and "pc" id prefix).
 * Regenerate with:  node scripts/generate-practice-block-maps.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRACTICE_BLOCK_SPECS } from "../config/california/practice-block-specs.mjs";
import { generateAll } from "./lib/generate-ca-block-maps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const course = {
  root,
  curriculumDir: path.join(root, "california/ca-real-estate-practice-45-v1/curriculum"),
  specs: PRACTICE_BLOCK_SPECS,
  courseId: "ca-real-estate-practice-45",
  idPrefix: "pc",
  outFile: (assignment) => path.join(root, `config/california/practice-a${assignment}-blocks.mjs`),
  exportPrefix: (assignment) => `A${assignment}`,
  generatorLabel: "Practice",
  generatorScriptName: "scripts/generate-practice-block-maps.mjs",
};

for (const outPath of generateAll(course)) {
  console.log("generated", path.relative(root, outPath));
}
