/**
 * CA-BLOCK-1 — the learning-block delivery engine.
 *
 * WHAT THIS ENGINE OWNS. The delivery layer only: block/screen structure, lesson-range slicing,
 * the formative retrieval bank, and SERVER-SIDE mastery derivation. It owns none of the
 * regulatory layer — sections, the applied exercise, the knowledge check, remediation, time,
 * elapsed-period and final-exam gating all remain in config/california-course-engine.mjs and the
 * existing endpoints, and nothing here can weaken them: block evidence only ever ADDS a
 * requirement in the student's path, never substitutes for a regulatory one.
 *
 * THE COVERAGE INVARIANT. Every screen addresses a range of the frozen lesson file by the file's
 * own headings. `assertCoverage` proves the ranges tile the entire file — every line belongs to
 * exactly one screen (or the one apparatus heading range) — so no source content can silently
 * disappear from the delivery layer. It throws; the structural test calls it against the real file.
 *
 * MASTERY IS DERIVED, NEVER ACCEPTED. `deriveBlockStatus` computes a block's state from recorded
 * evidence rows alone. There is no code path that reads a client-supplied "mastered" flag: the
 * server recomputes state on every request, and the mutation tests prove that fabricated flags
 * change nothing.
 */

import { A1_BLOCKS, A1_RETRIEVAL_BANK, A1_SPACED_RETRIEVAL } from "./california/mortgage-a1-blocks.mjs";

/* ── pilot registry ─────────────────────────────────────────────────────────────────────────
   Block delivery exists for exactly the pilot assignment. Assignments 2–15 and every other
   course keep the existing delivery until the owner reviews the pilot — the registry is the
   rollout switch, and it is deliberately one entry long. */
const BLOCK_DELIVERY = new Map([
  [`${A1_BLOCKS.courseId}:${A1_BLOCKS.assignmentId}`, A1_BLOCKS],
]);

export function getBlockDelivery(courseId, assignmentId) {
  return BLOCK_DELIVERY.get(`${courseId}:${assignmentId}`) || null;
}

export function hasBlockDelivery(courseId, assignmentId) {
  return BLOCK_DELIVERY.has(`${courseId}:${assignmentId}`);
}

/* ── lesson-range slicing ───────────────────────────────────────────────────────────────────
   A range is { from, to }: `from` is an exact heading line of the lesson file ("^" = top of
   file), `to` is the exact heading line the range stops before ("$" = end of file). Slicing is
   line-anchored and exact — a missing heading is an error, never an empty screen. */
function headingIndex(lines, heading, label) {
  if (heading === "^") return 0;
  if (heading === "$") return lines.length;
  const index = lines.findIndex((line) => line.trim() === heading);
  if (index < 0) throw new Error(`block delivery: heading not found in lesson content: "${heading}" (${label})`);
  return index;
}

export function sliceLessonRange(markdown, range, label = "") {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const start = headingIndex(lines, range.from, label);
  const end = headingIndex(lines, range.to, label);
  if (end <= start) throw new Error(`block delivery: empty or inverted range ${range.from} → ${range.to} (${label})`);
  return lines.slice(start, end).join("\n");
}

/** Every content-bearing screen range plus the apparatus ranges, in file order, must tile the
    whole lesson file: first starts at ^, each next starts where the previous ended, last ends
    at $. Throws with the first seam that fails. */
export function assertCoverage(delivery, markdown) {
  const lines = String(markdown || "").replace(/\r/g, "").split("\n");
  const ranges = [];
  for (const block of delivery.blocks) {
    for (const screen of block.screens) {
      if (screen.content) ranges.push({ ...screen.content, label: screen.id });
    }
  }
  for (const [index, range] of (delivery.apparatusRanges || []).entries()) {
    ranges.push({ ...range, label: `apparatus-${index}` });
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
   Items are authored with the correct answer at index 0 and permuted at serve exactly as the
   regulatory banks are, with the same deterministic permutation, so a recorded selected_choice
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
  const item = A1_RETRIEVAL_BANK[questionId];
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

/** The browser payload: no correct choice, no rationale — the same discipline as
    publicAssessment in the course engine. */
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
   Inputs are recorded evidence only:
     completedScreens — screen ids with recorded completion rows;
     attempts — block assessment attempt rows ({ question_id, kind, correct, created_at }), in
       insertion order;
     regulatory — for a regulatoryMastery block, the existing assignment row's derived facts.
   Output status ∈ NOT_STARTED | IN_PROGRESS | RETRIEVAL_REQUIRED | REMEDIATION_REQUIRED |
   MASTERED, plus what remains. */
export const BLOCK_STATUS = Object.freeze([
  "NOT_STARTED", "IN_PROGRESS", "RETRIEVAL_REQUIRED", "REMEDIATION_REQUIRED", "MASTERED",
]);

export function deriveBlockStatus(block, { completedScreens = [], attempts = [], regulatory = null } = {}) {
  const done = new Set(completedScreens);
  const contentScreens = block.screens.filter((screen) => screen.type !== "retrieval");
  const practiceScreens = block.screens.filter((screen) => screen.type === "practice");
  const retrievalScreens = block.screens.filter((screen) => screen.type === "retrieval");

  const contentDone = contentScreens.every((screen) => done.has(screen.id));
  /* Practice screens complete like any content screen. Writing an analysis is OPTIONAL
     (owner decision 2026-08-28): a saved analysis is still recorded as evidence when the
     student chooses to write one, but its absence never blocks the block. practiceScreens
     is kept for structural checks; it no longer gates progression. */
  void practiceScreens;

  /* Retrieval evidence per retrieval screen: a correct primary answer, or — after an incorrect
     primary — a recorded remediation review followed by a correct answer on the DIFFERENT
     replacement question. The exact question the student missed is never re-served. */
  let retrievalState = "satisfied";
  let activeRemediation = null;
  for (const screen of retrievalScreens) {
    const primaryId = screen.questionId;
    const item = A1_RETRIEVAL_BANK[primaryId];
    const primaryAttempts = attempts.filter((attempt) => attempt.question_id === primaryId && attempt.kind === "retrieval");
    const primaryCorrect = primaryAttempts.some((attempt) => attempt.correct === true);
    if (primaryCorrect) continue;
    if (!primaryAttempts.length) { retrievalState = "required"; break; }
    /* Primary answered and missed: remediation path. */
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

  /* A regulatory-mastery block (B7) is mastered by the EXISTING assignment record and nothing
     else — the block layer cannot re-derive, and therefore cannot weaken, the regulatory gate. */
  if (block.regulatoryMastery) {
    const regulatoryDone = Boolean(regulatory
      && regulatory.appliedComplete
      && regulatory.engagementComplete
      && (regulatory.remediationStatus === "not_required" || regulatory.remediationStatus === "satisfied"));
    if (!done.size && !regulatoryDone) return { status: "NOT_STARTED", activeRemediation: null };
    if (contentDone && regulatoryDone) return { status: "MASTERED", activeRemediation: null };
    return { status: "IN_PROGRESS", activeRemediation: null };
  }

  if (!done.size && !attempts.length) return { status: "NOT_STARTED", activeRemediation: null };
  if (retrievalState === "remediation") return { status: "REMEDIATION_REQUIRED", activeRemediation };
  if (contentDone && retrievalState === "required") return { status: "RETRIEVAL_REQUIRED", activeRemediation: null };
  if (contentDone && retrievalState === "satisfied" && retrievalScreens.length > 0) {
    return { status: "MASTERED", activeRemediation: null };
  }
  /* A block with no retrieval screen would master on content alone; the structural test
     asserts every substantive block HAS one, so this branch exists only for completeness. */
  if (contentDone && retrievalScreens.length === 0) return { status: "MASTERED", activeRemediation: null };
  return { status: "IN_PROGRESS", activeRemediation: null };
}

/** Where the student resumes: the first screen not yet completed of the first unmastered block —
    and if remediation is active, the remediation instruction screen rather than the top of the
    block. Exactness here IS the resume feature. */
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

/* ── section evidence roll-up ───────────────────────────────────────────────────────────────
   The regulatory layer counts six viewed instructional segments. Under block delivery a source
   section is evidenced when EVERY instruction screen of the block teaching it is completed —
   stronger evidence than the scroll-past observer it replaces, produced by the same server that
   records the screens. */
export function sectionsEvidenced(delivery, completedScreensByBlock) {
  const sections = [];
  for (const block of delivery.blocks) {
    if (!block.sourceSections?.length) continue;
    const instruction = block.screens.filter((screen) => screen.type === "instruction");
    const done = new Set(completedScreensByBlock.get(block.id) || []);
    if (instruction.length && instruction.every((screen) => done.has(screen.id))) {
      sections.push(...block.sourceSections);
    }
  }
  return [...new Set(sections)].sort((a, b) => a - b);
}

/* ── media components: validation the architecture enforces now ─────────────────────────────
   No video ships in the Assignment 1 pilot; the model and its production gate exist so that when
   one does, it cannot ship silent or caption-less, and can never be the only place a legal rule
   appears. */
export function validateCourseVideo(video) {
  const failures = [];
  for (const field of ["videoId", "title", "blockId", "conceptIds", "source"]) {
    if (!video?.[field] || (Array.isArray(video[field]) && !video[field].length)) failures.push(`missing ${field}`);
  }
  if (!video?.captionsPath) failures.push("missing captions: a course video without captions cannot be production-ready");
  if (!video?.transcriptPath) failures.push("missing transcript: required legal instruction must exist in text equivalent");
  if (video?.textEquivalentScreenId == null) failures.push("missing textEquivalentScreenId: a video may never be the only place a rule appears");
  if (video?.autoplay) failures.push("autoplay is not permitted");
  return { productionReady: failures.length === 0, failures };
}

/* Placeholder visuals: allowed, clearly labelled, and worth zero regulated minutes — the label
   and the zero are both validated, so a placeholder cannot quietly become claimed time. */
export function validateVisualPlaceholder(placeholder) {
  const failures = [];
  if (placeholder?.label !== "VISUAL ASSET PLANNED") failures.push("placeholder must be labelled exactly VISUAL ASSET PLANNED");
  if (Number(placeholder?.contributesMinutes) !== 0) failures.push("a placeholder visual contributes zero regulated instructional time");
  return { valid: failures.length === 0, failures };
}

export function spacedRetrievalSchedule() {
  return A1_SPACED_RETRIEVAL;
}

export default Object.freeze({
  getBlockDelivery, hasBlockDelivery, sliceLessonRange, assertCoverage,
  getBlockQuestion, publicBlockQuestion, scoreBlockQuestion,
  deriveBlockStatus, derivePosition, sectionsEvidenced, BLOCK_STATUS,
  validateCourseVideo, validateVisualPlaceholder, spacedRetrievalSchedule,
});
