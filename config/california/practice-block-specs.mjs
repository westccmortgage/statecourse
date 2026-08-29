/**
 * CA-BLOCK rollout — the HAND-AUTHORED pedagogy for Real Estate Practice assignments.
 *
 * Same apparatus as the Mortgage and Principles rollouts (see mortgage-block-specs.mjs for the
 * full design rationale): the generator (scripts/generate-practice-block-maps.mjs) derives every
 * screen range from the frozen lesson's own headings; what it must never invent lives here,
 * written after reading the lesson — each block's learning objective (blocks B1-B6 follow the
 * lesson's six sections; the seventh entry is B7, synthesis), and the mapping of the eight
 * practice problems to the block teaching their concept. Every problem 1-8 must be assigned to
 * exactly one block. Block/screen ids use the "pc" prefix (e.g. "pc1-b3") to stay collision-free
 * with Mortgage's "a" prefix and Principles' "pr" prefix once all three share one registry.
 */

export const PRACTICE_BLOCK_SPECS = {};
