/**
 * TX-BLOCK — generate learning-block maps for Texas Principles of Real Estate I.
 * See scripts/lib/generate-tx-block-maps.mjs for the parsing design (Texas's own Unit/exercise/
 * recap shape, not California's six-section template).
 * Regenerate with:  node scripts/generate-tx-principles-block-maps.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { UNIT_OBJECTIVES, UNIT_TRACE } from "../config/texas/principles-i-course.mjs";
import { generateModuleBlocks } from "./lib/generate-tx-block-maps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const unitObjectives = Object.fromEntries(
  Object.entries(UNIT_OBJECTIVES).map(([code, objectives]) => [code, objectives[0]]),
);

const unitCodesByModule = new Map();
for (const trace of UNIT_TRACE) {
  const moduleNumber = Number(trace.module.replace("module-0", "").replace("module-", ""));
  if (!unitCodesByModule.has(moduleNumber)) unitCodesByModule.set(moduleNumber, []);
  unitCodesByModule.get(moduleNumber).push(trace.code);
}

const course = {
  root,
  curriculumDir: path.join(root, "texas/tx-principles-real-estate-i-30-v1/curriculum"),
  courseId: "tx-principles-real-estate-i-30-v1",
  unitObjectives,
  outFile: (moduleNumber) => path.join(root, `config/texas/principles-i-module-${moduleNumber}-blocks.mjs`),
};

for (const moduleNumber of [...unitCodesByModule.keys()].sort((a, b) => a - b)) {
  const outPath = generateModuleBlocks({ ...course, unitCodes: unitCodesByModule.get(moduleNumber) }, moduleNumber);
  console.log("generated", path.relative(root, outPath));
}
