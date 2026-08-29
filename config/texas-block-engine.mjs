/**
 * TX-BLOCK — the learning-block delivery engine for Texas courses.
 *
 * Mirrors config/california-block-engine.mjs's mechanics (lesson-range slicing, the coverage
 * invariant, the formative retrieval bank, server-derived mastery) but is deliberately smaller:
 * Texas has no live regulatory course engine wired to this content yet (TX_PROVIDER_RULE_SOURCE_LOCK
 * is not clean, finalExaminationAdministrable is false, enrollmentEnabled is false — see
 * config/texas/regulatory-manifest.mjs), so there is no regulatory-mastery block, no section-count
 * roll-up, and no student-facing route reads this module yet. This is a content/data-layer build:
 * block/screen structure, coverage proof, and formative question scoring only. Nothing here claims
 * TREC approval, enrollment, or credit — see california-block-engine.mjs's own header for the same
 * discipline applied to California.
 *
 * THE COVERAGE INVARIANT. Every screen addresses a range of the frozen module file by the file's
 * own headings. `assertCoverage` proves the ranges tile the entire file — every line belongs to
 * exactly one screen — so no source content can silently disappear from the delivery layer.
 *
 * MASTERY IS DERIVED, NEVER ACCEPTED. `deriveBlockStatus` computes a block's state from recorded
 * evidence rows alone — there is no code path that reads a client-supplied "mastered" flag.
 */

import { BLOCK_DELIVERIES, RETRIEVAL_BANKS } from "./texas/texas-block-registry.mjs";

/* ── delivery registry ────────────────────────────────────────────────────────────────────── */
const BLOCK_DELIVERY = new Map(
  BLOCK_DELIVERIES.map((delivery) => [`${delivery.courseId}:${delivery.moduleId}`, delivery]),
);

export function getBlockDelivery(courseId, moduleId) {
  return BLOCK_DELIVERY.get(`${courseId}:${moduleId}`) || null;
}

export function hasBlockDelivery(courseId, moduleId) {
  return BLOCK_DELIVERY.has(`${courseId}:${moduleId}`);
}

/* ── lesson-range slicing ───────────────────────────────────────────────────────────────────
   Identical contract to california-block-engine.mjs: { from, to } is line-anchored and exact
   ("^" = top of file, "$" = end of file); a missing heading is an error, never an empty screen. */
function headingIndex(lines, heading, label) {
  if (heading === "^") return 0;
  if (heading === "$") return lines.length;
  const index = lines.findIndex((line) => line.trim() === heading);
  if (index < 0) throw new Error(`block delivery: heading not found in module content: "${heading}" (${label})`);
  return index;
}

export function sliceLessonRange(markdown, range, label = "") {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const start = headingIndex(lines, range.from, label);
  const end = headingIndex(lines, range.to, label);
  if (end <= start) throw new Error(`block delivery: empty or inverted range ${range.from} → ${range.to} (${label})`);
  return lines.slice(start, end).join("\n");
}

/** Every content-bearing screen range, in file order, must tile the whole module file: first
    starts at ^, each next starts where the previous ended, last ends at $. */
export function assertCoverage(delivery, markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const ranges = [];
  for (const block of delivery.blocks) {
    for (const screen of block.screens) {
      if (screen.content) ranges.push({ ...screen.content, label: screen.id });
    }
  }
  const placed = ranges.map((range) => ({
    label: range.label,
    start: headingIndex(lines, range.from, range.label),
    end: headingIndex(lines, range.to, range.label),
  })).sort((a, b) => a.start - b.start);
  if (!placed.length) throw new Error("block delivery: no content ranges");
  if (placed[0].start !== 0) throw new Error(`block delivery: coverage does not start at the top of the file (first covered line ${placed[0].start}, ${placed[0].label})`);
  for (let index = 1; index < placed.length; index += 1) {
    if (placed[index].start !== placed[index - 1].end) {
      throw new Error(`block delivery: coverage gap or overlap between ${placed[index - 1].label} (ends ${placed[index - 1].end}) and ${placed[index].label} (starts ${placed[index].start})`);
    }
  }
  const last = placed[placed.length - 1];
  if (last.end !== lines.length) throw new Error(`block delivery: coverage stops at line ${last.end} of ${lines.length} (${last.label})`);
  return { ranges: placed.length, lines: lines.length };
}

/* ── retrieval bank ─────────────────────────────────────────────────────────────────────────
   Same deterministic permutation as california-block-engine.mjs: correct answer is authored at
   index 0, permuted at serve time keyed on courseId+questionId, so a recorded selected_choice
   keeps meaning the same option forever. */
function hashKey(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function permuteChoices(choices, correctChoice, key) {
  const order = choices.map((_, index) => index);
  let seed = hashKey(key) || 1;
  for (let index = order.length - 1; index > 0; index -= 1) {
    seed = (Math.imul(seed, 48271) + 11) >>> 0;
    const swap = seed % (index + 1);
    [order[index], order[swap]] = [order[swap], order[index]];
  }
  return { choices: order.map((index) => choices[index]), correctChoice: order.indexOf(correctChoice) };
}

export function getBlockQuestion(courseId, questionId) {
  const item = RETRIEVAL_BANKS[questionId];
  if (!item) return null;
  const presented = permuteChoices(item.choices, item.correctChoice, `${courseId}:${questionId}`);
  return {
    id: questionId,
    blockId: item.blockId,
    concept: item.concept,
    role: item.role,
    replacementId: item.replacementId,
    remediationScreen: item.remediationScreen,
    prompt: item.prompt,
    choices: presented.choices,
    correctChoice: presented.correctChoice,
    rationale: item.rationale,
  };
}

/** The browser payload: no correct choice, no rationale. */
export function publicBlockQuestion(question) {
  if (!question) return null;
  return { id: question.id, blockId: question.blockId, prompt: question.prompt, choices: [...question.choices] };
}

export function scoreBlockQuestion(question, choiceIndex) {
  if (!question) return null;
  const selected = typeof choiceIndex === "number"
    ? choiceIndex
    : (typeof choiceIndex === "string" && /^\d+$/.test(choiceIndex.trim()) ? Number(choiceIndex.trim()) : Number.NaN);
  if (!Number.isInteger(selected) || selected < 0 || selected >= question.choices.length) return null;
  const correct = selected === question.correctChoice;
  return { questionId: question.id, selectedChoice: selected, correct, rationale: question.rationale, concept: question.concept };
}

/* ── mastery derivation ─────────────────────────────────────────────────────────────────────
   Inputs are recorded evidence only: completedScreens (screen ids with recorded completion rows)
   and attempts (block assessment attempt rows, in insertion order). No regulatory-mastery block
   exists in Texas yet — every block masters on content + retrieval evidence alone. */
export const BLOCK_STATUS = Object.freeze([
  "NOT_STARTED", "IN_PROGRESS", "RETRIEVAL_REQUIRED", "REMEDIATION_REQUIRED", "MASTERED",
]);

export function deriveBlockStatus(block, { completedScreens = [], attempts = [] } = {}) {
  const done = new Set(completedScreens);
  const contentScreens = block.screens.filter((screen) => screen.type !== "retrieval");
  const retrievalScreens = block.screens.filter((screen) => screen.type === "retrieval");

  const contentDone = contentScreens.every((screen) => done.has(screen.id));

  /* Retrieval evidence per retrieval screen: a correct primary answer, or — after an incorrect
     primary — a recorded remediation review followed by a correct answer on the DIFFERENT
     replacement question. The exact question the student missed is never re-served. */
  let retrievalState = "satisfied";
  let activeRemediation = null;
  for (const screen of retrievalScreens) {
    const primaryId = screen.questionId;
    const item = RETRIEVAL_BANKS[primaryId];
    const primaryAttempts = attempts.filter((attempt) => attempt.question_id === primaryId && attempt.kind === "retrieval");
    const primaryCorrect = primaryAttempts.some((attempt) => attempt.correct === true);
    if (primaryCorrect) continue;
    if (!primaryAttempts.length) { retrievalState = "required"; break; }
    const reviewed = attempts.some((attempt) => attempt.kind === "remediation_review" && attempt.screen_id === screen.id);
    const replacementId = item?.replacementId || null;
    const replacementCorrect = replacementId
      ? attempts.some((attempt) => attempt.question_id === replacementId && attempt.kind === "replacement" && attempt.correct === true)
      : false;
    if (replacementCorrect) continue;
    retrievalState = "remediation";
    activeRemediation = {
      screenId: screen.id,
      remediationScreen: item?.remediationScreen || null,
      reviewed,
      replacementQuestionId: reviewed ? replacementId : null,
    };
    break;
  }

  if (!done.size && !attempts.length) return { status: "NOT_STARTED", activeRemediation: null };
  if (retrievalState === "remediation") return { status: "REMEDIATION_REQUIRED", activeRemediation };
  if (contentDone && retrievalState === "required") return { status: "RETRIEVAL_REQUIRED", activeRemediation: null };
  if (contentDone && retrievalState === "satisfied" && retrievalScreens.length > 0) {
    return { status: "MASTERED", activeRemediation: null };
  }
  if (contentDone && retrievalScreens.length === 0) return { status: "MASTERED", activeRemediation: null };
  return { status: "IN_PROGRESS", activeRemediation: null };
}

/** Where the student resumes: the first screen not yet completed of the first unmastered block —
    and if remediation is active, the remediation instruction screen rather than the top of the
    block. */
export function derivePosition(delivery, statusByBlock, progressByBlock) {
  for (const block of delivery.blocks) {
    const derived = statusByBlock.get(block.id);
    if (derived.status === "MASTERED") continue;
    if (derived.status === "REMEDIATION_REQUIRED" && derived.activeRemediation) {
      const target = derived.activeRemediation.reviewed && derived.activeRemediation.replacementQuestionId
        ? derived.activeRemediation.screenId
        : (derived.activeRemediation.remediationScreen || derived.activeRemediation.screenId);
      return { blockId: block.id, screenId: target, remediation: true };
    }
    const done = new Set(progressByBlock.get(block.id)?.completedScreens || []);
    const next = block.screens.find((screen) => !done.has(screen.id)) || block.screens[block.screens.length - 1];
    return { blockId: block.id, screenId: next.id, remediation: false };
  }
  const last = delivery.blocks[delivery.blocks.length - 1];
  return { blockId: last.id, screenId: last.screens[last.screens.length - 1].id, remediation: false };
}

export default Object.freeze({
  getBlockDelivery, hasBlockDelivery, sliceLessonRange, assertCoverage,
  getBlockQuestion, publicBlockQuestion, scoreBlockQuestion,
  deriveBlockStatus, derivePosition, BLOCK_STATUS,
});
