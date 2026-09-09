/**
 * TX-BLOCK — generate learning-block maps for Texas Law of Agency.
 *
 * Same generator core as Principles of Real Estate I and II (scripts/lib/generate-tx-block-maps.mjs):
 * screen ranges are derived from each frozen module's own headings, never by copying text. The unit
 * codes are the LOA-1 form's own T<topic>U<unit> codes, transcribed in
 * config/texas/law-of-agency-course-form.mjs from the approval form itself.
 *
 * Learning objectives are hand-authored, one per unit, and live in
 * config/texas/law-of-agency-course.mjs. They are imported here rather than re-derived at generate
 * time for the reason the Principles II wrapper gives: an objective that were re-derived from module
 * prose could change silently when a module changed, and nobody would see it in a diff. Holding them
 * in the course record makes every change to an objective a reviewable edit to a file under review.
 *
 * They are also NOT the module's front-matter "Learning objectives" sentence split one clause per
 * unit. That split works for only five of the twelve modules — clause counts do not match unit
 * counts, and the reduction passes rewrote several of the sentences — so each objective was written
 * against the unit it belongs to, from the frozen text of that unit.
 *
 * THE CURRICULUM IS FROZEN. Every module is hashed at LOA-CONTENT-FREEZE-2026-08-30
 * (texas/tx-law-of-agency-30-v1/content-freeze.json). This script reads those files and writes
 * nothing back to them; run `node scripts/freeze-loa-curriculum.mjs` afterwards and it must still
 * report "freeze intact".
 *
 * OPTIONAL REFERENCE SECTIONS. Modules 02, 03, 07, 09, 10, 11 and 12 close with a
 * "## Optional reference:" section. The generator gives each its own trailing block with
 * required:false, nonBlocking, excludedFromRequiredTime and noAssessmentMayDependOnThis, and stops
 * the recap's range at it, so optional material is never delivered as required review.
 *
 * Regenerate with:  node scripts/generate-tx-law-of-agency-block-maps.mjs
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { TOPICS } from "../config/texas/law-of-agency-course-form.mjs";
import { UNIT_OBJECTIVES } from "../config/texas/law-of-agency-course.mjs";
import { SCREEN_MEDIA_BY_MODULE } from "../config/texas/law-of-agency-screen-media.mjs";
import { generateModuleBlocks } from "./lib/generate-tx-block-maps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const course = {
  root,
  curriculumDir: path.join(root, "texas/tx-law-of-agency-30-v1/curriculum"),
  courseId: "tx-law-of-agency-30-v1",
  unitObjectives: UNIT_OBJECTIVES,
  outFile: (moduleNumber) => path.join(root, `config/texas/law-of-agency-module-${moduleNumber}-blocks.mjs`),
  generatedHeader: (nn) => `/**
 * GENERATED FILE — Texas Law of Agency, Module ${nn} learning-block map.
 * Derived from the frozen module's own headings by scripts/generate-tx-law-of-agency-block-maps.mjs
 * at LOA-CONTENT-FREEZE-2026-08-30. Learning objectives come from
 * config/texas/law-of-agency-course.mjs's UNIT_OBJECTIVES, hand-authored one per LOA-1 unit.
 * The retrieval screens name question ids for a Law of Agency retrieval bank that does not exist
 * yet, so no block here is deliverable to a student. Do not edit by hand — regenerate.
 */`,
};

let blocks = 0;
let screens = 0;
for (const [index, topic] of TOPICS.entries()) {
  const moduleNumber = index + 1;
  const unitCodes = topic.units.map((unit) => unit.code);
  const outPath = generateModuleBlocks({
    ...course,
    unitCodes,
    screenMedia: SCREEN_MEDIA_BY_MODULE[moduleNumber] || {},
  }, moduleNumber);
  const generated = await import(`file://${outPath}?t=${Date.now()}`);
  const delivery = generated.default;
  const optional = delivery.blocks.filter((block) => block.optional).length;
  blocks += delivery.blocks.length;
  screens += delivery.blocks.reduce((total, block) => total + block.screens.length, 0);
  console.log(
    "generated", path.relative(root, outPath),
    `(${unitCodes.length} units, ${delivery.blocks.length} blocks, ${delivery.blocks.reduce((t, b) => t + b.screens.length, 0)} screens${optional ? ", 1 optional-reference block" : ""})`,
  );
}
console.log(`total: ${blocks} blocks, ${screens} screens across ${TOPICS.length} modules`);
