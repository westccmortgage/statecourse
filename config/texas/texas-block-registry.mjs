/**
 * TX-BLOCK — the registry of every module with block delivery, for Texas Principles of Real
 * Estate I. Mirrors config/california/california-block-registry.mjs's registration discipline:
 * a module is registered only once its block map and retrieval bank both exist, and the load-time
 * invariants below refuse to load a half-built registration — a module missing a primary,
 * replacement, or remediation screen can never reach a student.
 *
 * Keyed by courseId + moduleId (not assignmentId — Texas's natural unit is the module, not a
 * DRE-style assignment), consumed by config/texas-block-engine.mjs.
 */

import { MODULE_1_BLOCKS } from "./principles-i-module-1-blocks.mjs";
import { MODULE_2_BLOCKS } from "./principles-i-module-2-blocks.mjs";
import { MODULE_3_BLOCKS } from "./principles-i-module-3-blocks.mjs";
import { MODULE_4_BLOCKS } from "./principles-i-module-4-blocks.mjs";
import { MODULE_5_BLOCKS } from "./principles-i-module-5-blocks.mjs";
import { MODULE_6_BLOCKS } from "./principles-i-module-6-blocks.mjs";
import { MODULE_7_BLOCKS } from "./principles-i-module-7-blocks.mjs";
import { MODULE_8_BLOCKS } from "./principles-i-module-8-blocks.mjs";
import { MODULE_9_BLOCKS } from "./principles-i-module-9-blocks.mjs";
import { PRINCIPLES_I_RETRIEVAL_BANK } from "./principles-i-block-retrieval.mjs";

export const BLOCK_DELIVERIES = Object.freeze([
  MODULE_1_BLOCKS,
  MODULE_2_BLOCKS,
  MODULE_3_BLOCKS,
  MODULE_4_BLOCKS,
  MODULE_5_BLOCKS,
  MODULE_6_BLOCKS,
  MODULE_7_BLOCKS,
  MODULE_8_BLOCKS,
  MODULE_9_BLOCKS,
]);

export const RETRIEVAL_BANKS = Object.freeze({ ...PRINCIPLES_I_RETRIEVAL_BANK });

/* ── Load-time invariants: a registration is complete or it does not load. ─────────────────
   Mirrors california-block-registry.mjs's checks, minus the regulatory-mastery (B7) branch —
   Texas has no regulatory-mastery block, because no student-facing route or regulatory course
   engine reads this registry yet. */
const seenModules = new Set();
for (const delivery of BLOCK_DELIVERIES) {
  const key = `${delivery.courseId}:${delivery.moduleId}`;
  if (seenModules.has(key)) throw new Error(`TX block registry: ${key} registered twice`);
  seenModules.add(key);
  for (const block of delivery.blocks) {
    const retrieval = block.screens.filter((screen) => screen.type === "retrieval");
    if (retrieval.length === 0) continue; // the module-recap block carries no retrieval screen
    if (retrieval.length !== 1) throw new Error(`TX block registry: ${block.id} needs exactly one retrieval screen`);
    const primaryId = retrieval[0].questionId;
    const primary = RETRIEVAL_BANKS[primaryId];
    if (!primary || primary.role !== "primary" || primary.blockId !== block.id) {
      throw new Error(`TX block registry: ${block.id} lacks its primary retrieval item ${primaryId}`);
    }
    const replacement = RETRIEVAL_BANKS[primary.replacementId];
    if (!replacement || replacement.role !== "replacement" || replacement.blockId !== block.id || replacement.concept !== primary.concept) {
      throw new Error(`TX block registry: ${block.id} lacks a same-concept replacement for ${primaryId}`);
    }
    const screenIds = new Set(block.screens.map((screen) => screen.id));
    for (const item of [primary, replacement]) {
      if (!screenIds.has(item.remediationScreen)) {
        throw new Error(`TX block registry: ${block.id} remediation screen ${item.remediationScreen} does not exist`);
      }
      if (item.correctChoice !== 0) throw new Error(`TX block registry: ${item.blockId} item must author the correct answer first`);
      if (item.choices.length !== 4) throw new Error(`TX block registry: ${item.blockId} item must offer four choices`);
    }
  }
}
for (const [questionId, item] of Object.entries(RETRIEVAL_BANKS)) {
  const owner = BLOCK_DELIVERIES.find((delivery) => delivery.blocks.some((block) => block.id === item.blockId));
  if (!owner) throw new Error(`TX block registry: bank item ${questionId} names unregistered block ${item.blockId}`);
}

export default Object.freeze({ BLOCK_DELIVERIES, RETRIEVAL_BANKS });
