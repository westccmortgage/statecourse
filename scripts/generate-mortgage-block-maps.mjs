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
 *
 * This script is now a thin per-course config wrapper around the shared generator core in
 * scripts/lib/generate-ca-block-maps.mjs, which Principles and Practice reuse identically —
 * the parsing, chunking, and B7 logic live in exactly one place for all three courses.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { MORTGAGE_BLOCK_SPECS } from "../config/california/mortgage-block-specs.mjs";
import { generateAll } from "./lib/generate-ca-block-maps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const course = {
  root,
  curriculumDir: path.join(root, "california/ca-mortgage-loan-brokering-lending-45-v1/curriculum"),
  specs: MORTGAGE_BLOCK_SPECS,
  courseId: "ca-mortgage-loan-brokering-lending-45",
  idPrefix: "a",
  outFile: (assignment) => path.join(root, `config/california/mortgage-a${assignment}-blocks.mjs`),
  exportPrefix: (assignment) => `A${assignment}`,
  generatorLabel: "Mortgage",
  generatorScriptName: "scripts/generate-mortgage-block-maps.mjs",
};

for (const outPath of generateAll(course)) {
  console.log("generated", path.relative(root, outPath));
}
