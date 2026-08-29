/**
 * CA-BLOCK — generate learning-block maps for Real Estate Principles.
 * Thin per-course config wrapper over the shared generator core in scripts/lib/generate-ca-block-maps.mjs
 * (see scripts/generate-mortgage-block-maps.mjs for the full design notes — identical logic, this
 * course's own curriculum directory, spec module, and "pr" id prefix).
 * Regenerate with:  node scripts/generate-principles-block-maps.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRINCIPLES_BLOCK_SPECS } from "../config/california/principles-block-specs.mjs";
import { generateAll } from "./lib/generate-ca-block-maps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const course = {
  root,
  curriculumDir: path.join(root, "california/ca-real-estate-principles-45-v1/curriculum"),
  specs: PRINCIPLES_BLOCK_SPECS,
  courseId: "ca-real-estate-principles-45",
  idPrefix: "pr",
  outFile: (assignment) => path.join(root, `config/california/principles-a${assignment}-blocks.mjs`),
  exportPrefix: (assignment) => `A${assignment}`,
  generatorLabel: "Principles",
  generatorScriptName: "scripts/generate-principles-block-maps.mjs",
};

for (const outPath of generateAll(course)) {
  console.log("generated", path.relative(root, outPath));
}
