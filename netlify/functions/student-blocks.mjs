/**
 * CA-BLOCK-1 — the learning-block delivery endpoint.
 *
 * WHAT THIS ENDPOINT IS. The server side of the block player: it serves the block/screen
 * structure with per-student derived state, records screen, practice and retrieval evidence, and
 * DERIVES mastery from that evidence on every request. It is additive: the regulatory machinery —
 * sections, applied exercise, knowledge check, remediation, time, eligibility — stays in
 * student-course.mjs, whose exported helpers this endpoint reuses so the two cannot drift.
 *
 * THE SECURITY RULE. No client statement about state is believed. A request body may say
 * mastered:true, status:"MASTERED", correct:true — all of it is ignored: the only writes are
 * evidence rows for actions the server itself validated (a screen the student was positioned to
 * complete, an answer the server itself scored), and status is recomputed from evidence via
 * deriveBlockStatus before every response. The database's own trigger refuses a MASTERED row
 * without evidence as the last line.
 */

import { dbRequest } from "./_lib/db.mjs";
import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import { audit, contextFor, finishIfReady, statesFor, statusMap } from "./student-course.mjs";
import {
  deriveBlockStatus, derivePosition,
  publicBlockQuestion, scoreBlockQuestion, sectionsEvidenced,
} from "../../config/california-block-engine.mjs";
import { getCourseDelivery, getCourseQuestion as getBlockQuestion } from "../../config/course-registry.mjs";
import { applyConsoleVideos, consoleVideosForDelivery } from "./_lib/console-video-overlay.mjs";
import { contentForEnrollment, overlayText } from "./_lib/console-content.mjs";


function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}
function isoNow() { return new Date().toISOString(); }

function deliveryFor(ctx, assignmentId) {
  /* Resolved through the registry so a Texas module and a California assignment both
     arrive here as one delivery unit. */
  const delivery = getCourseDelivery(ctx.course.courseId, assignmentId);
  if (!delivery) fail("block_delivery_not_available", 404);
  return delivery;
}

async function progressRows(ctx, assignmentId) {
  if (ctx.mode !== "student") return [];
  return dbRequest(`lms_block_progress?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&select=*`) || [];
}

async function attemptRows(ctx, assignmentId) {
  if (ctx.mode !== "student") return [];
  return dbRequest(`lms_block_assessment_attempts?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&select=*&order=created_at.asc`) || [];
}

function regulatorySnapshot(assignments, assignmentId) {
  const row = assignments.find((item) => item.id === assignmentId);
  return row ? {
    viewedSections: row.viewedSections,
    appliedComplete: row.appliedComplete,
    engagementComplete: row.engagementComplete,
    remediationStatus: row.remediationStatus,
    activeSeconds: row.activeSeconds,
    status: row.status,
  } : null;
}

/** Everything derived in one place: per-block evidence, statuses, and the exact resume position. */
function deriveAll(delivery, progress, attempts, regulatory) {
  const progressByBlock = new Map(progress.map((row) => [row.block_id, {
    completedScreens: Array.isArray(row.completed_screens) ? row.completed_screens : [],
    row,
  }]));
  const attemptsByBlock = new Map();
  for (const attempt of attempts) {
    if (!attemptsByBlock.has(attempt.block_id)) attemptsByBlock.set(attempt.block_id, []);
    attemptsByBlock.get(attempt.block_id).push(attempt);
  }
  const statusByBlock = new Map();
  for (const block of delivery.blocks) {
    const evidence=attemptsByBlock.get(block.id)||[];
    const completed=new Set(progressByBlock.get(block.id)?.completedScreens||[]);
    for(const screen of block.screens.filter(s=>s.type==='retrieval')) {
      const item=getBlockQuestion(delivery.courseId,screen.questionId);
      if(evidence.some(a=>a.question_id===screen.questionId&&a.kind==='retrieval'&&a.correct===true)
        || (evidence.some(a=>a.screen_id===screen.id&&a.kind==='remediation_review')
          && evidence.some(a=>a.question_id===item?.replacementId&&a.kind==='replacement'&&a.correct===true))) completed.add(screen.id);
    }
    progressByBlock.set(block.id,{...progressByBlock.get(block.id),completedScreens:[...completed]});
    statusByBlock.set(block.id, deriveBlockStatus(block, {
      completedScreens: progressByBlock.get(block.id)?.completedScreens || [],
      attempts: attemptsByBlock.get(block.id) || [],
      regulatory,
      questionLookup:id=>getBlockQuestion(delivery.courseId,id),
    }));
  }
  const completedByBlock = new Map(delivery.blocks.map((block) => [
    block.id, progressByBlock.get(block.id)?.completedScreens || [],
  ]));
  const position = derivePosition(delivery, statusByBlock, progressByBlock);
  return { progressByBlock, attemptsByBlock, statusByBlock, completedByBlock, position };
}

/** The browser's view of a block: structure, derived status, and — for its retrieval screens —
    the answerable question in public (keyless) form. */
function publicBlocks(ctx, delivery, derived) {
  return delivery.blocks.map((block) => {
    const status = derived.statusByBlock.get(block.id);
    const completed = new Set(derived.completedByBlock.get(block.id));
    return {
      id: block.id,
      sequence: block.sequence,
      title: block.title,
      learningObjective: block.learningObjective,
      required: block.required !== false,
      regulatoryMastery: Boolean(block.regulatoryMastery),
      status: status.status,
      activeRemediation: status.activeRemediation,
      screens: block.screens.map((screen) => ({
        id: screen.id,
        sequence: screen.sequence,
        type: screen.type,
        title: screen.title,
        content: screen.content || null,
        practiceProblem: screen.practiceProblem || null,
        videos: screen.videos || null,
        documents: screen.documents || null,
        completed: completed.has(screen.id),
        ...(screen.type === "retrieval" ? {
          question: publicBlockQuestion(getBlockQuestion(ctx.course.courseId, screen.questionId)),
        } : {}),
      })),
    };
  });
}

async function upsertProgress(ctx, assignmentId, blockId, patch) {
  const existing = await dbRequest(`lms_block_progress?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&block_id=eq.${encodeURIComponent(blockId)}&select=block_id&limit=1`);
  if (existing?.length) {
    await dbRequest(`lms_block_progress?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&block_id=eq.${encodeURIComponent(blockId)}`, {
      method: "PATCH", prefer: "return=minimal", body: { ...patch, updated_at: isoNow() },
    });
  } else {
    await dbRequest("lms_block_progress", {
      method: "POST", prefer: "return=minimal",
      body: {
        enrollment_id: ctx.enrollment.id, student_id: ctx.studentId,
        course_id: ctx.course.courseId, course_version: ctx.enrollment.course_version,
        assignment_id: assignmentId, block_id: blockId,
        started_at: isoNow(), ...patch, updated_at: isoNow(),
      },
    });
  }
}

async function recordAttempt(ctx, assignmentId, blockId, body) {
  await dbRequest("lms_block_assessment_attempts", {
    method: "POST", prefer: "return=minimal",
    body: {
      enrollment_id: ctx.enrollment.id, student_id: ctx.studentId,
      course_id: ctx.course.courseId, course_version: ctx.enrollment.course_version,
      assignment_id: assignmentId, block_id: blockId, ...body,
    },
  });
}

/** After any evidence write: re-derive every status, persist the derived states, roll newly
    evidenced sections into the regulatory record, and point Resume Course at the exact position. */
async function settle(ctx, assignmentId, delivery, regulatory) {
  const [progress, attempts] = await Promise.all([
    progressRows(ctx, assignmentId), attemptRows(ctx, assignmentId),
  ]);
  const derived = deriveAll(delivery, progress, attempts, regulatory);

  for (const block of delivery.blocks) {
    const status = derived.statusByBlock.get(block.id);
    const row = derived.progressByBlock.get(block.id)?.row;
    if (!row && status.status === "NOT_STARTED") continue;
    const patch = {
      status: status.status,
      ...(status.status === "MASTERED" && !row?.mastered_at ? { mastered_at: isoNow() } : {}),
      last_activity_at: isoNow(),
    };
    if (!row || row.status !== status.status || (status.status === "MASTERED" && !row.mastered_at)) {
      await upsertProgress(ctx, assignmentId, block.id, patch);
    }
  }

  /* Section evidence: completing all instruction screens of a section's block evidences the
     section. The write path and audit event are the same ones the legacy observer used, so the
     regulatory record cannot tell the delivery models apart — and finishIfReady keeps the
     existing completion rule as the only completion rule. */
  const evidenced = sectionsEvidenced(delivery, derived.completedByBlock);
  const already = Array.isArray(regulatory?.viewedSections) ? regulatory.viewedSections : [];
  const missing = evidenced.filter((section) => !already.includes(section));
  if (missing.length && ctx.mode === "student") {
    const sections = [...new Set([...already, ...missing])].sort((a, b) => a - b);
    await dbRequest(`lms_assignment_state?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&assignment_id=eq.${encodeURIComponent(assignmentId)}&assignment_version=eq.1.0`, {
      method: "PATCH", prefer: "return=minimal",
      body: { viewed_sections: sections, status: "in_progress", updated_at: isoNow() },
    });
    for (const section of missing) {
      await audit(ctx, assignmentId, "section_viewed", { section, evidence: "block_screens_completed" });
    }
    await finishIfReady(ctx, assignmentId);
  }

  if (ctx.mode === "student") {
    const resume = `/student/course/blocks/?enrollment_id=${encodeURIComponent(ctx.enrollment.id)}&assignment=${encodeURIComponent(assignmentId)}`;
    await dbRequest(`student_portal_state?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}`, {
      method: "PATCH", prefer: "return=minimal",
      body: { resume_path: resume, last_activity_at: isoNow(), updated_at: isoNow() },
    }).catch(() => null);
  }
  return derived;
}

function findBlock(delivery, blockId) {
  const block = delivery.blocks.find((item) => item.id === blockId);
  if (!block) fail("unknown_block", 404);
  return block;
}

function findScreen(block, screenId) {
  const screen = block.screens.find((item) => item.id === screenId);
  if (!screen) fail("unknown_screen", 404);
  return screen;
}

/** Strict linear order: a screen may be acted on only when every earlier screen in its block is
    complete and every earlier block is mastered — or when it is already complete (idempotence). */
function assertReachable(delivery, derived, block, screen) {
  for (const prior of delivery.blocks) {
    if (prior.sequence >= block.sequence) break;
    if (derived.statusByBlock.get(prior.id).status !== "MASTERED") fail("previous_block_not_mastered", 409);
  }
  const completed = new Set(derived.completedByBlock.get(block.id));
  if (completed.has(screen.id)) return;
  for (const prior of block.screens) {
    if (prior.sequence >= screen.sequence) break;
    if (prior.type === "retrieval") {
      /* A retrieval screen is "complete" when its evidence is satisfied, which block status
         derivation already enforces before later blocks; inside a block, retrieval is last. */
      continue;
    }
    if (!completed.has(prior.id)) fail("previous_screen_not_completed", 409);
  }
}

async function handleEvent(ctx, input) {
  const assignmentId = String(input.assignmentId || "");
  const delivery = deliveryFor(ctx, assignmentId);
  if (ctx.mode !== "student") {
    /* Reviewers browse; reviewer actions record review audit rows and never student evidence. */
    await audit(ctx, assignmentId, "review_block_" + String(input.eventType || "event"), { no_student_credit: true });
    return { ok: true, noStudentCredit: true };
  }
  const assignments = statusMap(ctx.course, await statesFor(ctx), ctx.mode);
  const nav = assignments.find((item) => item.id === assignmentId);
  if (!nav?.accessible) fail("assignment_locked", 403);
  const regulatory = regulatorySnapshot(assignments, assignmentId);
  const eventType = String(input.eventType || "");

  const [progress, attempts] = await Promise.all([
    progressRows(ctx, assignmentId), attemptRows(ctx, assignmentId),
  ]);
  const derived = deriveAll(delivery, progress, attempts, regulatory);

  if (eventType === "screen_completed") {
    const block = findBlock(delivery, String(input.blockId || ""));
    const screen = findScreen(block, String(input.screenId || ""));
    if (screen.type === "retrieval") fail("retrieval_screens_complete_by_evidence", 409);
    assertReachable(delivery, derived, block, screen);
    const completed = new Set(derived.completedByBlock.get(block.id));
    if (!completed.has(screen.id)) {
      completed.add(screen.id);
      await upsertProgress(ctx, assignmentId, block.id, {
        completed_screens: [...completed],
        current_screen_id: screen.id,
        status: derived.statusByBlock.get(block.id).status === "NOT_STARTED" ? "IN_PROGRESS" : derived.statusByBlock.get(block.id).status,
      });
      await audit(ctx, assignmentId, "block_screen_completed", { block_id: block.id, screen_id: screen.id, screen_type: screen.type });
    }
    const settled = await settle(ctx, assignmentId, delivery, regulatory);
    return { ok: true, position: settled.position, blockStatus: settled.statusByBlock.get(block.id) };
  }

  if (eventType === "practice_committed") {
    const block = findBlock(delivery, String(input.blockId || ""));
    const screen = findScreen(block, String(input.screenId || ""));
    if (screen.type !== "practice") fail("not_a_practice_screen", 409);
    assertReachable(delivery, derived, block, screen);
    /* Writing an analysis is OPTIONAL (owner decision 2026-08-28). This event exists for the
       student who chooses to save one: the only refusal is an empty save, because there is
       nothing to record — revealing the solution without writing goes through screen_completed
       and is never blocked. No minimum length applies. */
    const response = String(input.response || "").trim();
    if (!response.length) fail("practice_response_empty");
    const priorCommits = (derived.attemptsByBlock.get(block.id) || []).filter((attempt) => attempt.kind === "practice" && attempt.screen_id === screen.id);
    await recordAttempt(ctx, assignmentId, block.id, {
      screen_id: screen.id, kind: "practice", attempt_number: priorCommits.length + 1,
      response: { analysis: response.slice(0, 8000) }, correct: null,
    });
    const completed = new Set(derived.completedByBlock.get(block.id));
    completed.add(screen.id);
    await upsertProgress(ctx, assignmentId, block.id, { completed_screens: [...completed], current_screen_id: screen.id });
    await audit(ctx, assignmentId, "block_practice_committed", { block_id: block.id, screen_id: screen.id, characters: response.length });
    const settled = await settle(ctx, assignmentId, delivery, regulatory);
    return { ok: true, solutionUnlocked: true, position: settled.position, blockStatus: settled.statusByBlock.get(block.id) };
  }

  if (eventType === "retrieval_answered") {
    const block = findBlock(delivery, String(input.blockId || ""));
    const questionId = String(input.questionId || "");
    const question = getBlockQuestion(ctx.course.courseId, questionId);
    if (!question || question.blockId !== block.id) fail("unknown_question", 404);
    const retrievalScreen = block.screens.find((screen) => screen.type === "retrieval" &&
      (screen.questionId===questionId || getBlockQuestion(ctx.course.courseId,screen.questionId)?.replacementId===questionId));
    if (!retrievalScreen) fail("block_has_no_retrieval", 409);
    const blockState = derived.statusByBlock.get(block.id);

    if (question.role === "primary") {
      if (blockState.status !== "RETRIEVAL_REQUIRED") fail("retrieval_not_open", 409);
      if(derived.position.blockId!==block.id||derived.position.screenId!==retrievalScreen.id)fail('retrieval_not_open',409);
    } else {
      /* A replacement is answerable only inside an active remediation whose review is recorded —
         and it is by definition a DIFFERENT question from the one the student missed. */
      const active = blockState.activeRemediation;
      if (blockState.status !== "REMEDIATION_REQUIRED" || !active?.reviewed || active.replacementQuestionId !== questionId) {
        fail("replacement_not_open", 409);
      }
    }

    const score = scoreBlockQuestion(question, input.choiceIndex);
    if (!score) fail("invalid_answer");
    const kind = question.role === "primary" ? "retrieval" : "replacement";
    const prior = (derived.attemptsByBlock.get(block.id) || []).filter((attempt) => attempt.question_id === questionId && attempt.kind === kind);
    await recordAttempt(ctx, assignmentId, block.id, {
      screen_id: retrievalScreen.id, question_id: questionId, concept_id: question.concept,
      kind, attempt_number: prior.length + 1,
      response: { selected_choice: score.selectedChoice }, correct: score.correct,
      remediation_required: kind === "retrieval" && !score.correct,
      replacement_question_id: kind === "retrieval" && !score.correct ? question.replacementId : null,
    });
    await audit(ctx, assignmentId, "block_retrieval_answered", {
      block_id: block.id, question_id: questionId, kind, correct: score.correct, concept: question.concept,
    });
    const settled = await settle(ctx, assignmentId, delivery, regulatory);
    const after = settled.statusByBlock.get(block.id);
    return {
      ok: true,
      correct: score.correct,
      /* The explanation teaches on both outcomes; on a miss it precedes remediation and a
         DIFFERENT question, so it hands over no replacement answer key. */
      rationale: score.rationale,
      blockStatus: after,
      position: settled.position,
      ...(kind === "retrieval" && !score.correct ? {
        remediation: {
          remediationScreenId: question.remediationScreen,
          replacementQuestionId: question.replacementId,
          reviewedRequiredFirst: true,
        },
      } : {}),
    };
  }

  if (eventType === "remediation_reviewed") {
    const block = findBlock(delivery, String(input.blockId || ""));
    const blockState = derived.statusByBlock.get(block.id);
    const active = blockState.activeRemediation;
    if (blockState.status !== "REMEDIATION_REQUIRED" || !active) fail("remediation_not_active", 409);
    if (active.reviewed) {
      const settledAlready = await settle(ctx, assignmentId, delivery, regulatory);
      return { ok: true, replacementQuestion: publicBlockQuestion(getBlockQuestion(ctx.course.courseId, settledAlready.statusByBlock.get(block.id).activeRemediation?.replacementQuestionId)), position: settledAlready.position };
    }
    await recordAttempt(ctx, assignmentId, block.id, {
      screen_id: active.screenId, kind: "remediation_review", attempt_number: 1, correct: null,
    });
    await audit(ctx, assignmentId, "block_remediation_reviewed", { block_id: block.id, screen_id: active.remediationScreen });
    const settled = await settle(ctx, assignmentId, delivery, regulatory);
    const replacementId = settled.statusByBlock.get(block.id).activeRemediation?.replacementQuestionId || null;
    return {
      ok: true,
      replacementQuestion: publicBlockQuestion(getBlockQuestion(ctx.course.courseId, replacementId)),
      position: settled.position,
    };
  }

  fail("invalid_block_event");
}

async function blocksPayload(ctx, assignmentId) {
  const delivery = deliveryFor(ctx, assignmentId);
  const assignments = statusMap(ctx.course, await statesFor(ctx), ctx.mode);
  const nav = assignments.find((item) => item.id === assignmentId);
  if (!nav) fail("invalid_assignment", 404);
  if (ctx.mode === "student" && !nav.accessible) fail("assignment_locked", 403);
  const regulatory = regulatorySnapshot(assignments, assignmentId);
  const [progress, attempts, publishedText] = await Promise.all([
    progressRows(ctx, assignmentId), attemptRows(ctx, assignmentId),
    contentForEnrollment(ctx.enrollment),
  ]);
  const derived = deriveAll(delivery, progress, attempts, regulatory);
  const completedAssignments = assignments.filter((item) => item.status === "completed").length;
  const masteredBlocks = delivery.blocks.filter((block) => derived.statusByBlock.get(block.id).status === "MASTERED").length;
  return {
    mode: ctx.mode,
    reviewNotice: ctx.mode === "student" ? null
      : "DRE Review Access — no qualifying credit will be awarded from this review enrollment.",
    course: {
      courseId: ctx.course.courseId,
      title: ctx.course.title,
      version: ctx.course.version,
      requiredHours: ctx.course.requiredHours,
      assignmentCount: ctx.course.assignmentCount,
    },
    assignment: {
      id: assignmentId,
      sequence: nav.sequence,
      title: nav.title,
      of: ctx.course.assignmentCount,
      contentPath: delivery.contentPath,
      regulatory,
    },
    header: {
      courseProgress: { completed: completedAssignments, total: assignments.length },
      currentAssignment: { mastered: masteredBlocks, blocks: delivery.blocks.length },
      studyTimeSeconds: Number(nav.activeSeconds || 0),
    },
    /* Block-map structure first, then whatever the console has released for this delivery
       unit laid over it. Read every time, so a withdrawal takes effect on the next load. */
    blocks: applyConsoleVideos(
      overlayText(publicBlocks(ctx, delivery, derived), publishedText, assignmentId),
      await consoleVideosForDelivery(ctx.course.courseId, assignmentId),
    ),
    position: derived.position,
    spacedRetrieval: [],
  };
}

export const handler = async (event) => {
  try {
    const auth = await requireStudentSession(event);
    const cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];
    const input = event.httpMethod === "POST" ? parseJson(event) : {};
    const enrollmentId = event.httpMethod === "GET"
      ? String(event.queryStringParameters?.enrollment_id || "")
      : String(input.enrollmentId || "");
    const ctx = await contextFor(auth.student.id, enrollmentId);
    if (event.httpMethod === "GET") {
      const payload = await blocksPayload(ctx, String(event.queryStringParameters?.assignment || ""));
      await audit(ctx, payload.assignment.id, "block_player_opened", { mode: ctx.mode, position: payload.position });
      return sessionResponse(200, payload, cookies);
    }
    if (event.httpMethod === "POST") {
      requireSameOrigin(event);
      const result = await handleEvent(ctx, input);
      return sessionResponse(200, result, cookies);
    }
    fail("method_not_allowed", 405);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Student blocks endpoint error", error?.message);
    return sessionResponse(status, { error: status >= 500 ? "student_blocks_unavailable" : error.message });
  }
};
