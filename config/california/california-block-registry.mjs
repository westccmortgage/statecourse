/**
 * CA-BLOCK rollout — the registry of every assignment with block delivery.
 *
 * The pilot registry lived inside the engine and was deliberately one entry long; the owner
 * approved the rollout on 2026-08-28, and this module is now the single place an assignment's
 * block delivery is registered. Assignment 1 keeps its hand-authored pilot definition; 2–15 are
 * generated from the frozen lessons' own headings (scripts/generate-mortgage-block-maps.mjs) with
 * hand-authored objectives, problem maps (mortgage-block-specs.mjs) and retrieval banks
 * (mortgage-retrieval-banks.mjs). Assignments are registered ONLY as their banks are authored —
 * an entry with a missing or incomplete bank refuses to load, so a half-built assignment can
 * never reach a student.
 */

import { A1_BLOCKS, A1_RETRIEVAL_BANK, A1_SPACED_RETRIEVAL } from "./mortgage-a1-blocks.mjs";
import { A2_BLOCKS } from "./mortgage-a2-blocks.mjs";
import { A3_BLOCKS } from "./mortgage-a3-blocks.mjs";
import { A4_BLOCKS } from "./mortgage-a4-blocks.mjs";
import { A5_BLOCKS } from "./mortgage-a5-blocks.mjs";
import { A6_BLOCKS } from "./mortgage-a6-blocks.mjs";
import { A7_BLOCKS } from "./mortgage-a7-blocks.mjs";
import { A8_BLOCKS } from "./mortgage-a8-blocks.mjs";
import { MORTGAGE_RETRIEVAL_BANKS } from "./mortgage-retrieval-banks.mjs";

export const BLOCK_DELIVERIES = Object.freeze([
  A1_BLOCKS,
  A2_BLOCKS,
  A3_BLOCKS,
  A4_BLOCKS,
  A5_BLOCKS,
  A6_BLOCKS,
  A7_BLOCKS,
  A8_BLOCKS,
]);

export const RETRIEVAL_BANKS = Object.freeze({ ...A1_RETRIEVAL_BANK, ...MORTGAGE_RETRIEVAL_BANKS });

/* Spaced retrieval stays a built capability with an empty schedule, exactly as in the pilot. */
export const SPACED_RETRIEVAL = Object.freeze([...A1_SPACED_RETRIEVAL]);

/* ── Load-time invariants: a registration is complete or it does not load. ─────────────── */

const seenAssignments = new Set();
for (const delivery of BLOCK_DELIVERIES) {
  const key = `${delivery.courseId}:${delivery.assignmentId}`;
  if (seenAssignments.has(key)) throw new Error(`block registry: ${key} registered twice`);
  seenAssignments.add(key);
  for (const block of delivery.blocks) {
    if (block.regulatoryMastery) {
      if (!/-b7$/.test(block.id)) throw new Error(`block registry: regulatory-mastery block ${block.id} must be the -b7 synthesis block (the database guard keys on it)`);
      continue;
    }
    const retrieval = block.screens.filter((screen) => screen.type === "retrieval");
    if (retrieval.length !== 1) throw new Error(`block registry: ${block.id} needs exactly one retrieval screen`);
    const primaryId = retrieval[0].questionId;
    const primary = RETRIEVAL_BANKS[primaryId];
    if (!primary || primary.role !== "primary" || primary.blockId !== block.id) {
      throw new Error(`block registry: ${block.id} lacks its primary retrieval item ${primaryId}`);
    }
    const replacement = RETRIEVAL_BANKS[primary.replacementId];
    if (!replacement || replacement.role !== "replacement" || replacement.blockId !== block.id || replacement.concept !== primary.concept) {
      throw new Error(`block registry: ${block.id} lacks a same-concept replacement for ${primaryId}`);
    }
    const screenIds = new Set(block.screens.map((screen) => screen.id));
    for (const item of [primary, replacement]) {
      if (!screenIds.has(item.remediationScreen)) {
        throw new Error(`block registry: ${block.id} remediation screen ${item.remediationScreen} does not exist`);
      }
      if (item.correctChoice !== 0) throw new Error(`block registry: ${item.blockId} item must author the correct answer first`);
      if (item.choices.length !== 4) throw new Error(`block registry: ${item.blockId} item must offer four choices`);
    }
  }
}
for (const [questionId, item] of Object.entries(RETRIEVAL_BANKS)) {
  const owner = BLOCK_DELIVERIES.find((delivery) => delivery.blocks.some((block) => block.id === item.blockId));
  if (!owner) throw new Error(`block registry: bank item ${questionId} names unregistered block ${item.blockId}`);
}

export default Object.freeze({ BLOCK_DELIVERIES, RETRIEVAL_BANKS, SPACED_RETRIEVAL });
