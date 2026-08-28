/**
 * CA-BLOCK-1 — the block learning pilot: the 25 required proofs plus mutation tests on the gates
 * that matter. Structural claims are tested against the real files; behavioral claims against the
 * pure derivation functions the server itself uses, so the test and the endpoint cannot disagree.
 */

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import { CALIFORNIA_COURSE_IDS, getCaliforniaAssessment, getCaliforniaCourse, getCaliforniaFinalExam } from "../config/california-course-engine.mjs";
import {
  assertCoverage, deriveBlockStatus, derivePosition, getBlockDelivery, getBlockQuestion,
  hasBlockDelivery, publicBlockQuestion, scoreBlockQuestion, sectionsEvidenced, sliceLessonRange,
  validateCourseVideo, validateVisualPlaceholder,
} from "../config/california-block-engine.mjs";
import { A1_BLOCKS, A1_RETRIEVAL_BANK, A1_SPACED_RETRIEVAL } from "../config/california/mortgage-a1-blocks.mjs";
import { validateDocumentDefinition } from "../config/document-lab-model.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

const COURSE_ID = "ca-mortgage-loan-brokering-lending-45";
const LESSON = read("california/ca-mortgage-loan-brokering-lending-45-v1/curriculum/lesson-01.md");
const DELIVERY = getBlockDelivery(COURSE_ID, "assignment-01");
const PLAYER_JS = read("public/statecourse/student/course/blocks/block-player.js");
const PLAYER_HTML = read("public/statecourse/student/course/blocks/index.html");
const PLAYER_CSS = read("public/statecourse/student/course/blocks/block-player.css");
const TOKENS_CSS = read("public/statecourse/student/design-tokens.css");
const BLOCKS_FN = read("netlify/functions/student-blocks.mjs");
const COURSE_FN = read("netlify/functions/student-course.mjs");
const MIGRATION = read("database/014_block_learning.sql");

/* Evidence builders for the derivation tests. */
const allScreens = (block, filter = () => true) => block.screens.filter(filter).map((screen) => screen.id);
const practiceAttempts = (block) => block.screens.filter((screen) => screen.type === "practice")
  .map((screen) => ({ kind: "practice", screen_id: screen.id, correct: null }));
function masteredEvidence(block) {
  const retrieval = block.screens.find((screen) => screen.type === "retrieval");
  return {
    completedScreens: allScreens(block, (screen) => screen.type !== "retrieval"),
    attempts: [
      ...practiceAttempts(block),
      { kind: "retrieval", question_id: retrieval.questionId, correct: true },
    ],
  };
}

/* ── 1-5: regulatory structure preserved, blocks beneath it ──────────────────────────────── */

test("1. California courses remain 45 hours with unchanged completion frame", () => {
  for (const id of CALIFORNIA_COURSE_IDS) {
    const course = getCaliforniaCourse(id);
    assert.equal(course.requiredHours, 45);
    assert.equal(course.minimumElapsedHours, 420);
    assert.equal(course.expectedMinutesPerAssignment, 180);
  }
});

test("2. the 15-assignment structure is unchanged", () => {
  for (const id of CALIFORNIA_COURSE_IDS) {
    const course = getCaliforniaCourse(id);
    assert.equal(course.assignmentCount, 15);
    assert.equal(course.assignments.length, 15);
    assert.deepEqual(course.assignments.map((item) => item.sequence), Array.from({ length: 15 }, (_, index) => index + 1));
  }
});

test("3. Assignment 1 remains one regulatory assignment — blocks create no new assignment", () => {
  assert.equal(DELIVERY.assignmentId, "assignment-01");
  const course = getCaliforniaCourse(COURSE_ID);
  assert.equal(course.assignments.filter((item) => item.id === "assignment-01").length, 1);
  /* no block id is shaped like an assignment id, and none enters the assignment list */
  for (const block of DELIVERY.blocks) assert.doesNotMatch(block.id, /^assignment-/);
});

test("4. learning blocks sit beneath Assignment 1, in sequence, all scoped to it", () => {
  assert.equal(DELIVERY.courseId, COURSE_ID);
  assert.ok(DELIVERY.blocks.length >= 2);
  assert.deepEqual(DELIVERY.blocks.map((block) => block.sequence), DELIVERY.blocks.map((_, index) => index + 1));
  for (const block of DELIVERY.blocks) {
    assert.ok(block.id.startsWith("a1-"), block.id);
    assert.ok(block.learningObjective.length > 40, `${block.id} has no real learning objective`);
    assert.ok(block.screens.length >= 2 || block.id === "a1-b7", `${block.id}: a block is 2–6+ screens, not a single scroll`);
  }
});

test("5. every Assignment 1 source section maps to exactly one block", () => {
  const sections = DELIVERY.blocks.flatMap((block) => block.sourceSections);
  assert.deepEqual([...sections].sort(), [1, 2, 3, 4, 5, 6]);
});

test("6. no source content disappears: the screen ranges tile the entire frozen lesson file", () => {
  const coverage = assertCoverage(DELIVERY, LESSON);
  assert.ok(coverage.ranges >= 30);
  assert.equal(coverage.lines, LESSON.replace(/\r/g, "").split("\n").length);
  /* and each range actually slices non-empty content */
  for (const block of DELIVERY.blocks) {
    for (const screen of block.screens) {
      if (screen.content) assert.ok(sliceLessonRange(LESSON, screen.content, screen.id).trim().length > 0, screen.id);
    }
  }
});

/* ── 7-10: one screen at a time, retrieval on a later screen ─────────────────────────────── */

test("7. no assignment renders as one continuous scroll under block delivery", () => {
  /* the player renders through a single screen container and slices only the current screen's
     range; it has no whole-document render path */
  assert.equal((PLAYER_HTML.match(/id="screenContent"/g) || []).length, 1);
  assert.doesNotMatch(PLAYER_JS, /screens\s*\.\s*map\([^)]*renderLessonMarkdown/);
  assert.doesNotMatch(PLAYER_JS, /renderLessonMarkdown\(\s*state\.lessonLines\.join/);
  /* and the legacy long-scroll page hands the pilot assignment off to the player */
  const legacy = read("public/statecourse/student/course/student-course.js");
  assert.match(legacy, /blockDelivery/);
  assert.match(legacy, /blockPlayerHref/);
});

test("8. exactly one active instructional screen renders at a time", () => {
  assert.equal((PLAYER_HTML.match(/<article/g) || []).length, 1);
  assert.match(PLAYER_JS, /const currentScreen = \(\) => currentBlock\(\)\.screens\[state\.view\.screenIndex\]/);
  /* every content render call is anchored to the current screen or the remediation target */
  const contentAssignments = PLAYER_JS.match(/content\.innerHTML\s*=/g) || [];
  assert.ok(contentAssignments.length > 0);
  assert.doesNotMatch(PLAYER_JS, /for\s*\(const screen of[^)]*\)\s*[^]*content\.innerHTML\s*\+=/);
});

test("9. future screen content is never dumped underneath the current screen", () => {
  /* the player appends nothing below the screen card, and the HTML shell carries no secondary
     content region for upcoming screens */
  assert.doesNotMatch(PLAYER_JS, /insertAdjacentHTML\(\s*["']beforeend["']\s*,\s*renderLessonMarkdown/);
  assert.doesNotMatch(PLAYER_HTML, /id="upcoming|id="nextScreens|class="screen-list/);
});

test("10. the retrieval check lives on a different screen from the instruction that answers it", () => {
  for (const block of DELIVERY.blocks) {
    for (const screen of block.screens) {
      if (screen.type !== "retrieval") continue;
      assert.equal(screen.content ?? null, null, `${screen.id} renders lesson content on the retrieval screen`);
      assert.ok(screen.sequence > 1, `${screen.id} is the block's first screen`);
      const question = A1_RETRIEVAL_BANK[screen.questionId];
      assert.ok(question, screen.id);
      const remediationTarget = block.screens.find((item) => item.id === question.remediationScreen);
      assert.ok(remediationTarget && remediationTarget.sequence < screen.sequence,
        `${screen.id}: remediation must return to an earlier instruction screen`);
    }
  }
  /* the retrieval-screen renderer shows no lesson slice */
  assert.match(PLAYER_JS, /type === "retrieval"\)\s*\{\s*\n?\s*content\.innerHTML = `<p class="activity-note">/);
});

/* ── 11-14: evidence-derived mastery, remediation, resume ────────────────────────────────── */

test("11. a required block cannot be mastered without assessment evidence", () => {
  const block = DELIVERY.blocks[0];
  const noEvidence = deriveBlockStatus(block, {
    completedScreens: allScreens(block, (screen) => screen.type !== "retrieval"),
    attempts: [],
  });
  assert.equal(noEvidence.status, "RETRIEVAL_REQUIRED");
  const withEvidence = deriveBlockStatus(block, masteredEvidence(block));
  assert.equal(withEvidence.status, "MASTERED");
});

test("12. an incorrect answer triggers remediation pointing at the exact instruction screen", () => {
  const block = DELIVERY.blocks[1]; /* a1-b2 */
  const retrieval = block.screens.find((screen) => screen.type === "retrieval");
  const derived = deriveBlockStatus(block, {
    completedScreens: allScreens(block, (screen) => screen.type !== "retrieval"),
    attempts: [
      ...practiceAttempts(block),
      { kind: "retrieval", question_id: retrieval.questionId, correct: false },
    ],
  });
  assert.equal(derived.status, "REMEDIATION_REQUIRED");
  assert.equal(derived.activeRemediation.remediationScreen, A1_RETRIEVAL_BANK[retrieval.questionId].remediationScreen);
  /* the replacement question is withheld until the review is recorded */
  assert.equal(derived.activeRemediation.replacementQuestionId, null);
});

test("13. the replacement question differs from the original and tests the same concept", () => {
  for (const [id, item] of Object.entries(A1_RETRIEVAL_BANK)) {
    if (item.role !== "primary") continue;
    const replacement = A1_RETRIEVAL_BANK[item.replacementId];
    assert.ok(replacement, `${id} has no replacement`);
    assert.notEqual(item.replacementId, id);
    assert.notEqual(replacement.prompt, item.prompt, `${id}: replacement repeats the question`);
    assert.equal(replacement.concept, item.concept, `${id}: replacement tests a different concept`);
    assert.equal(replacement.blockId, item.blockId);
  }
});

test("14. resume returns to the exact unfinished block and screen — and into active remediation", () => {
  const b1 = DELIVERY.blocks[0];
  const statusByBlock = new Map(DELIVERY.blocks.map((block) => [block.id, { status: "NOT_STARTED", activeRemediation: null }]));
  const progressByBlock = new Map();
  /* mid-block: two screens done in B1 */
  statusByBlock.set(b1.id, { status: "IN_PROGRESS", activeRemediation: null });
  progressByBlock.set(b1.id, { completedScreens: [b1.screens[0].id, b1.screens[1].id] });
  let position = derivePosition(DELIVERY, statusByBlock, progressByBlock);
  assert.deepEqual(position, { blockId: b1.id, screenId: b1.screens[2].id, remediation: false });
  /* active remediation resumes remediation, not the top of the block */
  const retrieval = b1.screens.find((screen) => screen.type === "retrieval");
  statusByBlock.set(b1.id, {
    status: "REMEDIATION_REQUIRED",
    activeRemediation: { screenId: retrieval.id, remediationScreen: "a1-b1-s2", reviewed: false, replacementQuestionId: null },
  });
  position = derivePosition(DELIVERY, statusByBlock, progressByBlock);
  assert.equal(position.remediation, true);
  assert.equal(position.screenId, "a1-b1-s2");
  /* after the review is recorded, resume lands on the replacement question screen */
  statusByBlock.set(b1.id, {
    status: "REMEDIATION_REQUIRED",
    activeRemediation: { screenId: retrieval.id, remediationScreen: "a1-b1-s2", reviewed: true, replacementQuestionId: "a1-b1-q2" },
  });
  position = derivePosition(DELIVERY, statusByBlock, progressByBlock);
  assert.equal(position.screenId, retrieval.id);
});

/* ── 15-18: regulatory gates, time, final examination untouched ──────────────────────────── */

test("15. the existing regulatory assignment-completion gates still operate, unweakened", () => {
  /* completion still requires sections + applied + engagement + remediation, only in
     student-course.mjs, and the block endpoint never writes an assignment completion */
  assert.match(COURSE_FN, /viewed\.length >= assignment\.sectionCount\s*&& row\.applied_exercise_complete\s*&& row\.engagement_check_complete\s*&& remediationSatisfied/);
  assert.doesNotMatch(BLOCKS_FN, /status:\s*"completed"/);
  assert.doesNotMatch(BLOCKS_FN, /applied_exercise_complete|engagement_check_complete/);
  /* the block layer feeds ONLY section evidence, through the same audit event, then defers to
     the one completion rule */
  assert.match(BLOCKS_FN, /finishIfReady\(ctx, assignmentId\)/);
  assert.match(BLOCKS_FN, /"section_viewed"/);
  /* B7 mastery derives FROM the regulatory record rather than substituting for it */
  const b7 = DELIVERY.blocks.find((block) => block.regulatoryMastery);
  assert.ok(b7);
  const notDone = deriveBlockStatus(b7, {
    completedScreens: allScreens(b7),
    attempts: [],
    regulatory: { appliedComplete: true, engagementComplete: false, remediationStatus: "not_required" },
  });
  assert.equal(notDone.status, "IN_PROGRESS");
  const done = deriveBlockStatus(b7, {
    completedScreens: allScreens(b7),
    attempts: [],
    regulatory: { appliedComplete: true, engagementComplete: true, remediationStatus: "satisfied" },
  });
  assert.equal(done.status, "MASTERED");
});

test("16. existing California time controls remain intact; block navigation credits no time", () => {
  /* the only crediting path is the existing heartbeat RPC, with its activity rule unchanged */
  assert.match(COURSE_FN, /record_california_heartbeat/);
  assert.match(COURSE_FN, /input\.visible && input\.focused && Number\(input\.idleSeconds \|\| 999\)<120/);
  assert.doesNotMatch(BLOCKS_FN, /record_california_heartbeat|active_seconds/);
  /* the player sends heartbeats through the existing endpoint and never awards time locally */
  assert.match(PLAYER_JS, /eventType: "heartbeat"/);
  assert.doesNotMatch(PLAYER_JS, /activeSeconds\s*\+=|creditedSeconds\s*=\s*\d/);
});

test("17. final-exam eligibility is not weakened by the block layer", () => {
  assert.doesNotMatch(BLOCKS_FN, /course_final_eligibility|final_exam/);
  const course = getCaliforniaCourse(COURSE_ID);
  assert.equal(course.finalPassingPercent, 60);
  assert.equal(course.finalQuestionCount, 100);
  assert.equal(course.maxFinalAttempts, 2);
});

test("18. the California final-exam bank is unchanged and untouched by blocks", () => {
  for (const form of ["A", "B"]) {
    const exam = getCaliforniaFinalExam(COURSE_ID, form);
    assert.equal(exam.items.length, 100);
  }
  /* nothing from the final bank was copied into the formative layer, in either direction */
  const finalPrompts = new Set(["A", "B"].flatMap((form) => getCaliforniaFinalExam(COURSE_ID, form).items.map((item) => item.prompt)));
  for (const item of Object.values(A1_RETRIEVAL_BANK)) {
    assert.equal(finalPrompts.has(item.prompt), false, "a final-exam question leaked into the block layer");
  }
  const blockConfig = read("config/california/mortgage-a1-blocks.mjs");
  assert.doesNotMatch(blockConfig, /final-exam-bank/);
});

test("19. the frozen California print artifact is byte-identical", () => {
  const pdf = fs.readFileSync(path.join(ROOT, "california/print/final/Real_Estate_Principles_45_Hour_Final_458pp.pdf"));
  assert.equal(pdf.length, 6441134);
  assert.equal(crypto.createHash("sha256").update(pdf).digest("hex"),
    "f9968a7d2fad6bec8e4d233541912bcbca24c7cdcabddaa6997f7bbab8eab4ef");
});

test("20. Texas substantive artifacts are untouched by this phase", async () => {
  const statutes = (await import("../config/texas/statute-sources.mjs")).default;
  assert.equal(statutes.SECTIONS_READ.length, 76);
  const prins1 = (await import("../config/texas/prins1-course-form.mjs")).default;
  assert.equal(prins1.FORM.totalMinutes, 1500);
  for (const file of ["config/california-block-engine.mjs", "config/california/mortgage-a1-blocks.mjs", "netlify/functions/student-blocks.mjs"]) {
    assert.doesNotMatch(read(file), /texas/i, `${file} reaches into Texas`);
  }
});

test("21. Arizona substantive records are untouched by this phase", () => {
  const registry = JSON.parse(read("public/statecourse/data/state-registry.json"));
  const arizona = registry.states.find((state) => state.state_code === "AZ");
  assert.ok(arizona, "Arizona missing from the registry");
  const serialized = JSON.stringify(arizona);
  assert.match(serialized, /S\.P\.S\./);
  for (const file of ["config/california-block-engine.mjs", "config/california/mortgage-a1-blocks.mjs", "netlify/functions/student-blocks.mjs"]) {
    assert.doesNotMatch(read(file), /arizona/i, `${file} reaches into Arizona`);
  }
});

/* ── 22-25: components and presentation ──────────────────────────────────────────────────── */

test("22. a placeholder visual is labelled and contributes zero regulated instructional time", () => {
  assert.equal(validateVisualPlaceholder({ label: "VISUAL ASSET PLANNED", contributesMinutes: 0 }).valid, true);
  assert.equal(validateVisualPlaceholder({ label: "VISUAL ASSET PLANNED", contributesMinutes: 5 }).valid, false);
  assert.equal(validateVisualPlaceholder({ label: "Coming soon", contributesMinutes: 0 }).valid, false);
  /* the player styles the placeholder with the required wording; nothing in the pilot claims
     minutes for one (time is heartbeat-derived, and no config field grants placeholder minutes) */
  assert.match(PLAYER_CSS, /visual-placeholder/);
  assert.doesNotMatch(read("config/california/mortgage-a1-blocks.mjs"), /contributesMinutes:\s*[1-9]/);
});

test("23. a video without captions and transcript cannot be production-ready, and may never be the only home of a rule", () => {
  const complete = validateCourseVideo({
    videoId: "v1", title: "t", blockId: "a1-b1", conceptIds: ["c"], source: "/media/x.mp4",
    captionsPath: "/media/x.vtt", transcriptPath: "/media/x.txt", textEquivalentScreenId: "a1-b1-s2",
  });
  assert.equal(complete.productionReady, true);
  for (const missing of ["captionsPath", "transcriptPath", "textEquivalentScreenId"]) {
    const video = {
      videoId: "v1", title: "t", blockId: "a1-b1", conceptIds: ["c"], source: "/media/x.mp4",
      captionsPath: "/media/x.vtt", transcriptPath: "/media/x.txt", textEquivalentScreenId: "a1-b1-s2",
    };
    delete video[missing];
    assert.equal(validateCourseVideo(video).productionReady, false, missing);
  }
  assert.equal(validateCourseVideo({ videoId: "v1", title: "t", blockId: "b", conceptIds: ["c"], source: "s", captionsPath: "c", transcriptPath: "t", textEquivalentScreenId: "s", autoplay: true }).productionReady, false);
  const component = read("public/statecourse/student/course/blocks/course-video.mjs");
  assert.match(component, /autoplay = false/);
  assert.doesNotMatch(component, /video\.autoplay = true/);
});

test("24. a client-only mastery bypass fails at every layer", () => {
  const block = DELIVERY.blocks[0];
  /* derivation ignores any forged fields riding on the inputs */
  const forged = deriveBlockStatus(block, {
    completedScreens: allScreens(block, (screen) => screen.type !== "retrieval"),
    attempts: [{ kind: "retrieval", question_id: "not-this-block", correct: true, mastered: true, status: "MASTERED" }],
    mastered: true,
    status: "MASTERED",
  });
  assert.notEqual(forged.status, "MASTERED");
  /* the endpoint reads no client status/mastery field */
  assert.doesNotMatch(BLOCKS_FN, /input\.mastered|input\.status|input\.correct\b/);
  /* the database refuses a MASTERED row without evidence */
  assert.match(MIGRATION, /cannot be MASTERED without correct retrieval evidence/);
  assert.match(MIGRATION, /before insert or update of status on lms_block_progress/);
});

test("25. mobile has no horizontal scrolling by construction", () => {
  assert.match(PLAYER_CSS, /html, body \{ overflow-x: hidden; \}/);
  assert.match(PLAYER_CSS, /\.table-wrap \{ max-width: 100%; overflow-x: auto/);
  assert.match(PLAYER_HTML, /name="viewport" content="width=device-width, initial-scale=1"/);
  const measure = TOKENS_CSS.match(/--sc-measure:\s*(\d+)px/);
  assert.ok(measure && Number(measure[1]) >= 700 && Number(measure[1]) <= 820, "readable measure outside the 700–820px band");
});

/* ── the pilot boundary: no rollout beyond Assignment 1 ──────────────────────────────────── */

test("block delivery exists for the pilot assignment only — nothing else converted", () => {
  assert.equal(hasBlockDelivery(COURSE_ID, "assignment-01"), true);
  for (let index = 2; index <= 15; index += 1) {
    assert.equal(hasBlockDelivery(COURSE_ID, "assignment-" + String(index).padStart(2, "0")), false);
  }
  for (const other of ["ca-real-estate-principles-45", "ca-real-estate-practice-45"]) {
    for (let index = 1; index <= 15; index += 1) {
      assert.equal(hasBlockDelivery(other, "assignment-" + String(index).padStart(2, "0")), false);
    }
  }
});

/* ── supporting structure ────────────────────────────────────────────────────────────────── */

test("student header shows designed language, not internal statuses or raw identifiers", () => {
  assert.match(PLAYER_JS, /Assignments`/);
  assert.match(PLAYER_JS, /Blocks Mastered`/);
  assert.doesNotMatch(PLAYER_JS, /SUBMISSION_DRAFT|QA_NON_CREDIT|qa_non_credit/);
  assert.doesNotMatch(PLAYER_JS, /My Progress 0:/);
  assert.match(BLOCKS_FN, /DRE Review Access — no qualifying credit will be awarded from this review enrollment\./);
});

test("the retrieval bank is formative, scenario-first, and serves without its key", () => {
  assert.equal(Object.keys(A1_RETRIEVAL_BANK).length, 12);
  for (const [id, item] of Object.entries(A1_RETRIEVAL_BANK)) {
    assert.ok(item.choices.length >= 3, `${id} is true/false`);
    assert.equal(item.correctChoice, 0, `${id}: correct answer authored at index 0 per project convention`);
    assert.ok(item.rationale.length > 80, `${id}: rationale too thin to teach`);
  }
  const served = getBlockQuestion(COURSE_ID, "a1-b3-q1");
  const isPublic = publicBlockQuestion(served);
  assert.equal(JSON.stringify(isPublic).includes("correctChoice"), false);
  assert.equal(JSON.stringify(isPublic).includes("rationale"), false);
  const score = scoreBlockQuestion(served, served.correctChoice);
  assert.equal(score.correct, true);
  assert.equal(scoreBlockQuestion(served, (served.correctChoice + 1) % served.choices.length).correct, false);
});

test("the regulatory instruments stay whole: mastery check items appear in no block", () => {
  const engagement = getCaliforniaAssessment(COURSE_ID, "assignment-01", "engagement");
  const remediation = getCaliforniaAssessment(COURSE_ID, "assignment-01", "remediation");
  const blockPrompts = new Set(Object.values(A1_RETRIEVAL_BANK).map((item) => item.prompt));
  for (const item of [...engagement.items, ...remediation.items]) {
    assert.equal(blockPrompts.has(item.prompt), false, "a regulatory item leaked into the block layer");
  }
});

test("spaced retrieval is architecture now, content later", () => {
  assert.deepEqual([...A1_SPACED_RETRIEVAL], []);
  assert.match(MIGRATION, /'spaced'/);
});

test("the document lab model refuses machine-guessed regions on regulated forms", () => {
  const valid = validateDocumentDefinition({
    documentId: "d1", title: "Sample", source: "CFPB", version: "1", effectiveDate: "2026-01-01",
    pages: [{ page: 1, imagePath: "/x.png", highlights: [{
      highlightId: "h1", region: { x: 10, y: 10, w: 30, h: 5 }, regionAuthor: "human",
      learningObjective: "o", explanation: "e", textEquivalent: "t",
    }] }],
  });
  assert.equal(valid.valid, true);
  const machine = validateDocumentDefinition({
    documentId: "d1", title: "Sample", source: "CFPB", version: "1", effectiveDate: "2026-01-01",
    pages: [{ page: 1, imagePath: "/x.png", highlights: [{
      highlightId: "h1", region: { x: 10, y: 10, w: 30, h: 5 }, regionAuthor: "model",
      learningObjective: "o", explanation: "e", textEquivalent: "t",
    }] }],
  });
  assert.equal(machine.valid, false);
  assert.ok(machine.failures.some((failure) => failure.includes("human-defined")));
});

/* ── mutation tests: prove the gates can fail ────────────────────────────────────────────── */

test("mutation: removing the correct retrieval attempt un-masters the block", () => {
  const block = DELIVERY.blocks[2];
  const evidence = masteredEvidence(block);
  assert.equal(deriveBlockStatus(block, evidence).status, "MASTERED");
  const mutated = { ...evidence, attempts: evidence.attempts.filter((attempt) => attempt.kind !== "retrieval") };
  assert.equal(deriveBlockStatus(block, mutated).status, "RETRIEVAL_REQUIRED");
});

test("mutation: a correct replacement without the recorded remediation review still leaves remediation active for the review step", () => {
  const block = DELIVERY.blocks[3];
  const retrieval = block.screens.find((screen) => screen.type === "retrieval");
  const primary = A1_RETRIEVAL_BANK[retrieval.questionId];
  const base = {
    completedScreens: allScreens(block, (screen) => screen.type !== "retrieval"),
    attempts: [
      ...practiceAttempts(block),
      { kind: "retrieval", question_id: retrieval.questionId, correct: false },
    ],
  };
  /* the replacement question is not even offered before the review is recorded */
  const beforeReview = deriveBlockStatus(block, base);
  assert.equal(beforeReview.activeRemediation.replacementQuestionId, null);
  /* with the review recorded, the replacement id opens, and a correct answer masters */
  const reviewed = {
    ...base,
    attempts: [...base.attempts, { kind: "remediation_review", screen_id: retrieval.id, correct: null }],
  };
  const afterReview = deriveBlockStatus(block, reviewed);
  assert.equal(afterReview.activeRemediation.replacementQuestionId, primary.replacementId);
  const answered = {
    ...reviewed,
    attempts: [...reviewed.attempts, { kind: "replacement", question_id: primary.replacementId, correct: true }],
  };
  assert.equal(deriveBlockStatus(block, answered).status, "MASTERED");
});

test("mutation: dropping a screen range breaks the coverage invariant loudly", () => {
  const mutated = JSON.parse(JSON.stringify(A1_BLOCKS));
  const screens = mutated.blocks[2].screens;
  const victim = screens.find((screen) => screen.content);
  victim.content = null;
  assert.throws(() => assertCoverage(mutated, LESSON), /gap|start|stops/);
});

/* ── the optional-practice decision (owner, 2026-08-28) ──────────────────────────────────
   Ordinary written-analysis practice is optional: no minimum length, no solution lock, no
   progression dependency. The SB 1495 participatory practicum is NOT one of these — its own
   suite (california-sb1495.test.mjs) proves both roles stay required. */

test("optional practice: a block masters without any written analysis", () => {
  const block = DELIVERY.blocks[1]; /* a1-b2 has a practice screen */
  const evidence = masteredEvidence(block);
  const withoutPractice = { ...evidence, attempts: evidence.attempts.filter((attempt) => attempt.kind !== "practice") };
  assert.equal(deriveBlockStatus(block, withoutPractice).status, "MASTERED");
});

test("optional practice: a voluntarily saved analysis still counts as recorded evidence, and old rows still read", () => {
  const block = DELIVERY.blocks[1];
  /* masteredEvidence includes historical practice rows exactly as students recorded them under
     the mandatory model — they must remain valid inputs and never regress a status. */
  assert.equal(deriveBlockStatus(block, masteredEvidence(block)).status, "MASTERED");
  assert.match(MIGRATION, /'retrieval','replacement','practice','remediation_review','spaced'/);
  assert.doesNotMatch(MIGRATION, /delete\s+from\s+lms_block_assessment_attempts/i);
});

test("optional practice: the endpoint reveals without text and saves without a minimum", () => {
  /* Revealing goes through screen_completed, which no longer refuses practice screens. */
  assert.doesNotMatch(BLOCKS_FN, /practice_screens_complete_by_commitment/);
  /* No character threshold anywhere in the endpoint. */
  assert.doesNotMatch(BLOCKS_FN, /PRACTICE_MINIMUM_CHARACTERS|practice_response_too_short/);
  /* The save path still records the attempt when the student chooses to write. */
  assert.match(BLOCKS_FN, /kind: "practice"/);
  assert.match(BLOCKS_FN, /practice_response_empty/);
});

test("optional practice: the player offers Reveal solution and Save my analysis with no counter", () => {
  const player = read("public/statecourse/student/course/blocks/block-player.js");
  assert.match(player, /Try it yourself/);
  assert.match(player, /\(optional\)/);
  assert.match(player, /Reveal solution/);
  assert.match(player, /Save my analysis/);
  assert.doesNotMatch(player, /at least 80 characters|Commit my analysis|more characters of analysis/);
});

test("mutation: incomplete instruction screens withhold the regulatory section evidence", () => {
  const complete = new Map(DELIVERY.blocks.map((block) => [
    block.id, block.screens.filter((screen) => screen.type === "instruction").map((screen) => screen.id),
  ]));
  assert.deepEqual(sectionsEvidenced(DELIVERY, complete), [1, 2, 3, 4, 5, 6]);
  const partial = new Map(complete);
  partial.set("a1-b3", complete.get("a1-b3").slice(0, 1));
  const evidenced = sectionsEvidenced(DELIVERY, partial);
  assert.deepEqual(evidenced, [1, 2, 4, 5, 6]);
});
