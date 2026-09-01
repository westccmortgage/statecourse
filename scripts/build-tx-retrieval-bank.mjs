/**
 * TX-BLOCK — one-time build step that reshapes the 28 existing TOPIC_QUIZZES items in
 * config/texas/principles-i-question-bank.mjs (already primary+replacement, already rationale'd,
 * already unit-tagged via `tests`) into the CA-BLOCK retrieval-bank shape, and resolves each
 * item's `remediation` markdown anchor into an actual generated screen id via the unit's own
 * `tests` code — no fragile anchor-string parsing needed, since the block id IS the lowercased
 * unit code by construction (scripts/generate-tx-principles-block-maps.mjs).
 *
 * Prints the adapted entries as ready-to-paste JS to stdout; the 18 units this bank does not yet
 * cover (T01U1, T01U3, T03U1, T03U3, T03U6, T05U2, T05U4, T05U5, T05U7, T05U9, T05U10, T06U1,
 * T06U4, T07U2, T07U5, T07U6, T07U8, T09U1) are hand-authored separately and appended by hand —
 * this script only saves re-typing the 28 that already exist in good shape.
 *
 * Usage: node scripts/build-tx-retrieval-bank.mjs > /tmp/adapted-28.txt
 */
import { TOPIC_QUIZZES } from "../config/texas/principles-i-question-bank.mjs";

const q = (value) => JSON.stringify(String(value));
const qArr = (arr) => `[\n${arr.map((c) => `      ${q(c)},`).join("\n")}\n    ]`;

const lines = [];
const seenBlocks = new Set();
for (const topic of Object.values(TOPIC_QUIZZES)) {
  for (const item of topic) {
    const blockId = item.tests.toLowerCase();
    /* A handful of units (T01U4, T02U2, T04U1, T08U1) carry two quiz items in the source bank.
       The block engine wires exactly one retrieval question per block, so the first quiz item
       encountered wins; the rest stay in TOPIC_QUIZZES, unused by this adaptation, rather than
       silently colliding on the same block's -q1/-q2 keys. */
    if (seenBlocks.has(blockId)) {
      console.error(`skip: ${item.id} — ${blockId} already has a retrieval item (${item.id} not adapted)`);
      continue;
    }
    seenBlocks.add(blockId);
    lines.push(`  ${q(`${blockId}-q1`)}: {
    blockId: ${q(blockId)}, concept: ${q(blockId)}, role: "primary",
    replacementId: ${q(`${blockId}-q2`)}, remediationScreen: ${q(`${blockId}-s1`)},
    prompt: ${q(item.prompt)},
    choices: ${qArr(item.choices)},
    correctChoice: ${item.correctChoice},
    rationale: ${q(item.rationale)},
  },`);
    lines.push(`  ${q(`${blockId}-q2`)}: {
    blockId: ${q(blockId)}, concept: ${q(blockId)}, role: "replacement",
    replacementId: null, remediationScreen: ${q(`${blockId}-s1`)},
    prompt: ${q(item.replacement.prompt)},
    choices: ${qArr(item.replacement.choices)},
    correctChoice: ${item.replacement.correctChoice},
    rationale: ${q(item.replacement.rationale)},
  },`);
  }
}
console.log(lines.join("\n"));
