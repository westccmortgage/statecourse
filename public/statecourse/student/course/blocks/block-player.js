/* CA-BLOCK-1 — the block player.
   One instructional screen at a time. The server owns all state: position, screen completion,
   retrieval scoring, remediation, mastery. This file renders the CURRENT screen only — future
   screens are never in the DOM — and reports evidence events; it never asserts state.
   Time: the existing heartbeat pipeline records active study exactly as the legacy page does,
   enriched with block/screen context for the roll-up. Navigating between screens never resets
   course time. */

import { renderLessonMarkdown, splitPracticeHtml, escapeHtml } from "/student/course/blocks/lesson-markdown.mjs";
import "/student/course/blocks/course-video.mjs";
import "/student/course/blocks/document-lab.mjs";

const params = new URLSearchParams(location.search);
const state = {
  enrollmentId: params.get("enrollment_id") || "",
  assignmentId: params.get("assignment") || "assignment-01",
  data: null,             // GET /api/student/blocks payload
  lessonLines: null,      // frozen lesson file, split for slicing
  coursePayload: null,    // GET /api/student/course payload (regulatory instruments for B7)
  view: null,             // { blockIndex, screenIndex, remediation:{...}|null }
  sessionId: crypto.randomUUID(),
  lastInteraction: Date.now(),
  heartbeat: null,
};

const $ = (selector) => document.querySelector(selector);
const message = $("#playerMessage");

/* ── api ─────────────────────────────────────────────────────────────────────────────────── */
async function api(path, options = {}) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  if (response.status === 401) {
    location.replace("/student/sign-in/?return_to=" + encodeURIComponent(location.pathname + location.search));
    throw new Error("signed_out");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.error || "request_failed"), { data });
  return data;
}
const getBlocks = () => api(`/api/student/blocks?enrollment_id=${encodeURIComponent(state.enrollmentId)}&assignment=${encodeURIComponent(state.assignmentId)}`);
const postBlocks = (body) => api("/api/student/blocks", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ enrollmentId: state.enrollmentId, assignmentId: state.assignmentId, ...body }),
});
const postCourse = (body) => api("/api/student/course", {
  method: "POST", headers: { "content-type": "application/json" },
  body: JSON.stringify({ enrollmentId: state.enrollmentId, assignmentId: state.assignmentId, ...body }),
});

/* ── lesson content ──────────────────────────────────────────────────────────────────────── */
async function loadLesson(contentPath) {
  const response = await fetch(contentPath, { headers: { accept: "text/markdown" }, cache: "no-store" });
  if (!response.ok) throw new Error("lesson_content_unavailable");
  state.lessonLines = (await response.text()).replace(/\r/g, "").split("\n");
}

function sliceRange(range) {
  const lines = state.lessonLines;
  const find = (heading) => heading === "^" ? 0 : heading === "$" ? lines.length : lines.findIndex((line) => line.trim() === heading);
  const start = find(range.from), end = find(range.to);
  if (start < 0 || end < 0 || end <= start) return "";
  return lines.slice(start, end).join("\n");
}

/* ── view helpers ────────────────────────────────────────────────────────────────────────── */
const blocks = () => state.data.blocks;
const currentBlock = () => blocks()[state.view.blockIndex];
const currentScreen = () => currentBlock().screens[state.view.screenIndex];

function viewFromPosition(position) {
  const blockIndex = Math.max(0, blocks().findIndex((block) => block.id === position.blockId));
  const block = blocks()[blockIndex];
  const screenIndex = Math.max(0, block.screens.findIndex((screen) => screen.id === position.screenId));
  const remediation = position.remediation ? activeRemediationFor(block) : null;
  return { blockIndex, screenIndex, remediation };
}

function activeRemediationFor(block) {
  if (block.status !== "REMEDIATION_REQUIRED" || !block.activeRemediation) return null;
  return { ...block.activeRemediation, blockId: block.id };
}

function formatMinutes(seconds) {
  const minutes = Math.floor(Math.max(0, Number(seconds || 0)) / 60);
  return `${minutes} min`;
}

/* ── header ──────────────────────────────────────────────────────────────────────────────── */
function renderHeader() {
  const { course, assignment, header } = state.data;
  const block = currentBlock();
  $("#courseTitle").textContent = course.title;
  document.title = `${course.title} | StateCourse`;
  $("#assignmentPosition").textContent = `Assignment ${assignment.sequence} of ${assignment.of}`;
  $("#blockPosition").textContent = `Block ${block.sequence} of ${blocks().length}`;
  const contentScreens = block.screens.length;
  $("#screenPosition").textContent = `Screen ${state.view.screenIndex + 1} of ${contentScreens}`;
  $("#screenPosition").className = "current";
  $("#courseProgress").textContent = `${header.courseProgress.completed} / ${header.courseProgress.total} Assignments`;
  $("#blockProgress").textContent = `${header.currentAssignment.mastered} / ${header.currentAssignment.blocks} Blocks Mastered`;
  $("#studyTime").textContent = formatMinutes(header.studyTimeSeconds);
  $("#blockOutline").innerHTML = blocks().map((item, index) => {
    const cls = item.status === "MASTERED" ? "outline-mastered" : index === state.view.blockIndex ? "outline-current" : "";
    return `<li class="${cls}">${escapeHtml(item.title)}</li>`;
  }).join("");
}

/* ── screen rendering: exactly one screen in the DOM ─────────────────────────────────────── */
function renderScreen() {
  renderHeader();
  const block = currentBlock();
  const screen = currentScreen();
  $("#blockKicker").textContent = `Block ${block.sequence}: ${block.title}`;
  $("#screenTitle").textContent = screen.title;
  const content = $("#screenContent");
  const activity = $("#screenActivity");
  activity.innerHTML = "";

  if (state.view.remediation) return renderRemediation(content, activity);

  if (screen.type === "retrieval") {
    content.innerHTML = `<p class="activity-note">Answer from memory — the lesson stays closed on this screen. That effort is what makes it stick.</p>`;
    renderQuestion(activity, screen.question, { blockId: block.id });
  } else if (screen.type === "practice") {
    const html = renderLessonMarkdown(sliceRange(screen.content));
    const { scenario, solution } = splitPracticeHtml(html);
    content.innerHTML = scenario;
    renderPractice(activity, block, screen, solution);
  } else if (screen.type === "applied") {
    content.innerHTML = renderLessonMarkdown(sliceRange(screen.content));
    renderRegulatoryAssessment(activity, "applied");
  } else if (screen.type === "mastery") {
    content.innerHTML = renderLessonMarkdown(sliceRange(screen.content));
    renderRegulatoryAssessment(activity, "engagement");
  } else if (screen.type === "completion") {
    content.innerHTML = renderLessonMarkdown(sliceRange(screen.content));
    renderCompletionStatus(activity);
  } else {
    content.innerHTML = renderLessonMarkdown(sliceRange(screen.content));
  }
  renderNav();
  content.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function renderNav() {
  const block = currentBlock();
  const screen = currentScreen();
  const previous = $("#previousScreen");
  const next = $("#continueScreen");
  previous.disabled = state.view.blockIndex === 0 && state.view.screenIndex === 0;
  const needsAction =
    (screen.type === "practice" && !screen.completed) ||
    (screen.type === "retrieval" && !["MASTERED"].includes(block.status) && !screenSatisfied(block, screen)) ||
    (screen.type === "applied" && !state.data.assignment.regulatory?.appliedComplete) ||
    (screen.type === "mastery" && !state.data.assignment.regulatory?.engagementComplete) ||
    Boolean(state.view.remediation);
  next.disabled = needsAction;
  const last = state.view.blockIndex === blocks().length - 1 && state.view.screenIndex === block.screens.length - 1;
  next.textContent = last ? "Finish" : "Continue";
}

function screenSatisfied(block, screen) {
  if (screen.type !== "retrieval") return screen.completed;
  /* A retrieval screen is satisfied when the block has moved past RETRIEVAL/REMEDIATION. */
  return block.status === "MASTERED";
}

/* ── practice screens: commit before the printed solution ────────────────────────────────── */
function renderPractice(activity, block, screen, solutionHtml) {
  if (screen.completed) {
    activity.innerHTML = `<div class="activity-panel"><h3>Worked solution</h3>${solutionHtml}</div>`;
    return;
  }
  activity.innerHTML = `
    <div class="activity-panel">
      <h3>Work the problem first</h3>
      <p class="activity-note">Write your analysis before the printed solution unlocks — at least 80 characters. Your response is recorded with this block's evidence.</p>
      <textarea id="practiceResponse" aria-label="Your analysis"></textarea>
      <p><button type="button" class="action-primary" id="practiceCommit">Commit my analysis</button></p>
      <p class="activity-note" id="practiceStatus" role="status"></p>
    </div>`;
  $("#practiceCommit").addEventListener("click", async () => {
    const response = $("#practiceResponse").value.trim();
    const status = $("#practiceStatus");
    if (response.length < 80) { status.textContent = `Keep going — ${80 - response.length} more characters of analysis before the solution unlocks.`; return; }
    $("#practiceCommit").disabled = true;
    try {
      await postBlocks({ eventType: "practice_committed", blockId: block.id, screenId: screen.id, response });
      await refresh({ keepView: true });
    } catch (error) {
      status.textContent = "We could not record your analysis. Please try again.";
      $("#practiceCommit").disabled = false;
    }
  });
}

/* ── retrieval, remediation, replacement ─────────────────────────────────────────────────── */
function questionForm(question, submitLabel) {
  return `
    <div class="activity-panel">
      <h3>Check your understanding</h3>
      <p>${escapeHtml(question.prompt)}</p>
      <div role="radiogroup" aria-label="Answer choices">
        ${question.choices.map((choice, index) => `
          <label class="choice"><input type="radio" name="retrieval" value="${index}"><span>${escapeHtml(choice)}</span></label>`).join("")}
      </div>
      <p><button type="button" class="action-primary" id="answerSubmit">${escapeHtml(submitLabel)}</button></p>
      <div id="answerResult"></div>
    </div>`;
}

function renderQuestion(activity, question, { blockId, replacement = false }) {
  const block = currentBlock();
  if (screenSatisfied(block, currentScreen())) {
    activity.innerHTML = `<p class="mastery-note">✓ Block mastered. This check is complete and recorded.</p>`;
    return;
  }
  if (!question) { activity.innerHTML = `<p class="activity-note">This check is not open yet.</p>`; return; }
  activity.innerHTML = questionForm(question, replacement ? "Submit answer to the new question" : "Submit answer");
  for (const label of activity.querySelectorAll(".choice")) {
    label.addEventListener("change", () => {
      activity.querySelectorAll(".choice").forEach((item) => item.classList.remove("selected"));
      label.classList.add("selected");
    });
  }
  $("#answerSubmit").addEventListener("click", async () => {
    const chosen = activity.querySelector("input[name=retrieval]:checked");
    const result = $("#answerResult");
    if (!chosen) { result.innerHTML = `<p class="activity-note">Choose an answer first.</p>`; return; }
    $("#answerSubmit").disabled = true;
    try {
      const outcome = await postBlocks({ eventType: "retrieval_answered", blockId, questionId: question.id, choiceIndex: Number(chosen.value) });
      if (outcome.correct) {
        result.innerHTML = `<div class="result-panel correct"><strong>Correct.</strong> ${escapeHtml(outcome.rationale || "")}</div>`;
        setTimeout(() => refresh({ keepView: true }), 1600);
      } else {
        result.innerHTML = `
          <div class="result-panel incorrect"><strong>Not quite.</strong> ${escapeHtml(outcome.rationale || "")}</div>
          <p><button type="button" class="action-secondary" id="goRemediate">Review the instruction, then try a new question</button></p>`;
        $("#goRemediate").addEventListener("click", () => refresh());
      }
    } catch (error) {
      result.innerHTML = `<p class="activity-note">We could not record this answer. Please try again.</p>`;
      $("#answerSubmit").disabled = false;
    }
  });
}

function renderRemediation(content, activity) {
  const remediation = state.view.remediation;
  const block = currentBlock();
  const target = block.screens.find((screen) => screen.id === remediation.remediationScreen)
    || block.screens.find((screen) => screen.type === "instruction");
  if (!remediation.reviewed) {
    $("#screenTitle").textContent = `Focused review: ${target?.title || block.title}`;
    content.innerHTML = target?.content ? renderLessonMarkdown(sliceRange(target.content)) : "";
    activity.innerHTML = `
      <div class="activity-panel">
        <h3>Then continue</h3>
        <p class="activity-note">Re-read the passage above with the missed idea in mind. When you are ready, a different question on the same concept follows — never the one you just saw.</p>
        <p><button type="button" class="action-primary" id="remediationDone">I have reviewed this — give me a new question</button></p>
      </div>`;
    $("#remediationDone").addEventListener("click", async () => {
      $("#remediationDone").disabled = true;
      try {
        const outcome = await postBlocks({ eventType: "remediation_reviewed", blockId: block.id });
        state.view.remediation = { ...remediation, reviewed: true, replacementQuestion: outcome.replacementQuestion };
        renderScreen();
      } catch { $("#remediationDone").disabled = false; }
    });
  } else {
    $("#screenTitle").textContent = "A new question on the same concept";
    content.innerHTML = `<p class="activity-note">Different question, same idea — answer from what you just reviewed.</p>`;
    renderQuestion(activity, state.view.remediation.replacementQuestion, { blockId: block.id, replacement: true });
  }
  renderNav();
}

/* ── B7: the existing regulatory instruments, unchanged ──────────────────────────────────── */
async function ensureCoursePayload() {
  if (!state.coursePayload) {
    state.coursePayload = await api(`/api/student/course?enrollment_id=${encodeURIComponent(state.enrollmentId)}&assignment=${encodeURIComponent(state.assignmentId)}`);
  }
  return state.coursePayload;
}

function renderRegulatoryAssessment(activity, kind) {
  activity.innerHTML = `<p class="activity-note">Loading…</p>`;
  ensureCoursePayload().then((payload) => {
    const regulatory = state.data.assignment.regulatory || {};
    const complete = kind === "applied" ? regulatory.appliedComplete : regulatory.engagementComplete;
    if (complete) {
      activity.innerHTML = `<p class="mastery-note">✓ Recorded for this assignment. This requirement is complete.</p>`;
      return;
    }
    if (kind === "engagement" && (regulatory.remediationStatus === "required" || regulatory.remediationStatus === "content_viewed")) {
      return renderRegulatoryRemediation(activity, payload);
    }
    const assessment = payload.assessments?.[kind];
    if (!assessment?.items?.length) { activity.innerHTML = `<p class="activity-note">This check is unavailable right now.</p>`; return; }
    activity.innerHTML = `
      <form class="activity-panel" id="regulatoryForm">
        <h3>${kind === "applied" ? "Applied exercise" : "Assignment mastery check"}</h3>
        ${assessment.items.length > 1 ? `<p class="activity-note">${assessment.items.length} scored items · ${assessment.passingPercent}% required.</p>` : ""}
        ${assessment.items.map((item, position) => `
          <fieldset data-item="${escapeHtml(item.id)}">
            <legend>${assessment.items.length > 1 ? `Question ${position + 1}. ` : ""}${escapeHtml(item.prompt)}</legend>
            ${item.choices.map((choice, index) => `<label class="choice"><input type="radio" name="${escapeHtml(item.id)}" value="${index}" required><span>${escapeHtml(choice)}</span></label>`).join("")}
          </fieldset>`).join("")}
        <p><button type="submit" class="action-primary">Submit answers</button></p>
        <div id="regulatoryResult"></div>
      </form>`;
    $("#regulatoryForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const answers = assessment.items.map((item) => data.get(item.id));
      if (answers.some((answer) => answer === null)) return;
      const result = $("#regulatoryResult");
      try {
        const outcome = await postCourse({ eventType: kind === "applied" ? "answer_applied" : "answer_engagement", answers: answers.map(Number) });
        result.innerHTML = `<div class="result-panel ${outcome.correct ? "correct" : "incorrect"}"><strong>${outcome.correct ? "Requirement met." : "Not yet."}</strong> ${escapeHtml(outcome.message || "")}</div>`;
        state.coursePayload = null;
        setTimeout(() => refresh({ keepView: true }), 1500);
      } catch (error) {
        result.innerHTML = `<p class="activity-note">We could not record these answers. Please try again.</p>`;
      }
    });
  }).catch(() => { activity.innerHTML = `<p class="activity-note">This check is unavailable right now.</p>`; });
}

function renderRegulatoryRemediation(activity, payload) {
  const regulatory = state.data.assignment.regulatory || {};
  if (regulatory.remediationStatus === "required") {
    activity.innerHTML = `
      <div class="activity-panel">
        <h3>Targeted remediation</h3>
        <p class="activity-note">That attempt did not reach the mastery threshold. Revisit the blocks for the concepts you missed — the outline above jumps to any block — then confirm your review to unlock a different five-item set on the same concepts.</p>
        <p><button type="button" class="action-primary" id="regRemediationViewed">I have reviewed the material</button></p>
      </div>`;
    $("#regRemediationViewed").addEventListener("click", async () => {
      $("#regRemediationViewed").disabled = true;
      try {
        await postCourse({ eventType: "remediation_content_viewed" });
        state.coursePayload = null;
        await refresh({ keepView: true });
      } catch { $("#regRemediationViewed").disabled = false; }
    });
    return;
  }
  const assessment = payload.assessments?.remediation;
  if (!assessment?.items?.length) { activity.innerHTML = `<p class="activity-note">Reload to open the alternate question set.</p>`; return; }
  activity.innerHTML = `
    <form class="activity-panel" id="regulatoryForm">
      <h3>Alternate question set</h3>
      <p class="activity-note">Different questions on the same concepts. ${assessment.passingPercent}% required.</p>
      ${assessment.items.map((item, position) => `
        <fieldset data-item="${escapeHtml(item.id)}">
          <legend>Question ${position + 1}. ${escapeHtml(item.prompt)}</legend>
          ${item.choices.map((choice, index) => `<label class="choice"><input type="radio" name="${escapeHtml(item.id)}" value="${index}" required><span>${escapeHtml(choice)}</span></label>`).join("")}
        </fieldset>`).join("")}
      <p><button type="submit" class="action-primary">Submit alternate answers</button></p>
      <div id="regulatoryResult"></div>
    </form>`;
  $("#regulatoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const answers = assessment.items.map((item) => data.get(item.id));
    if (answers.some((answer) => answer === null)) return;
    try {
      const outcome = await postCourse({ eventType: "answer_remediation", answers: answers.map(Number) });
      $("#regulatoryResult").innerHTML = `<div class="result-panel ${outcome.correct ? "correct" : "incorrect"}"><strong>${outcome.correct ? "Requirement met." : "Not yet."}</strong> ${escapeHtml(outcome.message || "")}</div>`;
      state.coursePayload = null;
      setTimeout(() => refresh({ keepView: true }), 1500);
    } catch {
      $("#regulatoryResult").innerHTML = `<p class="activity-note">We could not record these answers. Please try again.</p>`;
    }
  });
}

function renderCompletionStatus(activity) {
  const regulatory = state.data.assignment.regulatory || {};
  const done = regulatory.status === "completed";
  activity.innerHTML = done
    ? `<p class="mastery-note">✓ Assignment 1 is complete and recorded. The next assignment is open from My Courses.</p>`
    : `<p class="activity-note">This assignment completes automatically once every requirement above is recorded.</p>`;
}

/* ── navigation ──────────────────────────────────────────────────────────────────────────── */
async function advance() {
  const block = currentBlock();
  const screen = currentScreen();
  if (["instruction", "review", "applied", "mastery", "completion"].includes(screen.type) && !screen.completed) {
    try { await postBlocks({ eventType: "screen_completed", blockId: block.id, screenId: screen.id }); }
    catch (error) { /* surfaced via refresh */ }
    return refresh();
  }
  /* already-complete screen: move forward locally without re-posting */
  if (state.view.screenIndex < block.screens.length - 1) {
    state.view = { ...state.view, screenIndex: state.view.screenIndex + 1, remediation: null };
  } else if (state.view.blockIndex < blocks().length - 1) {
    state.view = { blockIndex: state.view.blockIndex + 1, screenIndex: 0, remediation: null };
  }
  renderScreen();
}

function goPrevious() {
  if (state.view.remediation) { state.view = { ...state.view, remediation: null }; return renderScreen(); }
  if (state.view.screenIndex > 0) {
    state.view = { ...state.view, screenIndex: state.view.screenIndex - 1 };
  } else if (state.view.blockIndex > 0) {
    const previousBlock = blocks()[state.view.blockIndex - 1];
    state.view = { blockIndex: state.view.blockIndex - 1, screenIndex: previousBlock.screens.length - 1, remediation: null };
  }
  renderScreen();
}

/* ── load & refresh ──────────────────────────────────────────────────────────────────────── */
async function refresh({ keepView = false } = {}) {
  const previousView = state.view;
  state.data = await getBlocks();
  if (!state.lessonLines) await loadLesson(state.data.assignment.contentPath);
  state.view = keepView && previousView
    ? {
        blockIndex: previousView.blockIndex,
        screenIndex: previousView.screenIndex,
        /* remediation view survives a refresh only while the server still derives it active */
        remediation: previousView.remediation ? activeRemediationFor(blocks()[previousView.blockIndex]) : null,
      }
    : viewFromPosition(state.data.position);
  if (state.view.remediation && previousView?.remediation?.replacementQuestion) {
    state.view.remediation.replacementQuestion = previousView.remediation.replacementQuestion;
  }
  renderScreen();
  message.hidden = true;
  $("#playerShell").hidden = false;
  const banner = $("#reviewBanner");
  banner.hidden = !state.data.reviewNotice;
  banner.textContent = state.data.reviewNotice || "";
}

/* ── time: the existing heartbeat pipeline, with screen context ──────────────────────────── */
async function sendHeartbeat() {
  if (!state.data) return;
  const idleSeconds = Math.floor((Date.now() - state.lastInteraction) / 1000);
  const visible = document.visibilityState === "visible";
  const focused = document.hasFocus();
  $("#timerState").textContent = !visible || !focused
    ? "Paused while this page is not active."
    : idleSeconds >= 120 ? "Paused after inactivity. Interact with the screen to resume."
    : "Active study is being recorded.";
  try {
    const result = await postCourse({
      eventType: "heartbeat", sessionId: state.sessionId, visible, focused, idleSeconds,
      userAgent: navigator.userAgent, blockId: currentBlock()?.id, screenId: currentScreen()?.id,
    });
    if (result?.creditedSeconds && state.data.mode === "student") {
      state.data.header.studyTimeSeconds += result.creditedSeconds;
      $("#studyTime").textContent = formatMinutes(state.data.header.studyTimeSeconds);
    }
  } catch {
    $("#timerState").textContent = "Connection interrupted. Study time is paused until the record reconnects.";
  }
}

/* ── wiring ──────────────────────────────────────────────────────────────────────────────── */
$("#continueScreen").addEventListener("click", advance);
$("#previousScreen").addEventListener("click", goPrevious);
$("#signOut").addEventListener("click", async () => {
  await fetch("/api/student/session", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
  location.replace("/student/sign-in/");
});
for (const eventName of ["pointerdown", "keydown", "scroll", "touchstart"]) {
  addEventListener(eventName, () => { state.lastInteraction = Date.now(); }, { passive: true });
}
document.addEventListener("visibilitychange", sendHeartbeat);
addEventListener("focus", () => { state.lastInteraction = Date.now(); sendHeartbeat(); });
addEventListener("blur", sendHeartbeat);

(async function start() {
  if (!state.enrollmentId) { location.replace("/student/"); return; }
  try {
    await refresh();
    clearInterval(state.heartbeat);
    sendHeartbeat();
    state.heartbeat = setInterval(sendHeartbeat, 15000);
  } catch (error) {
    console.error(error);
    message.textContent = error.message === "block_delivery_not_available"
      ? "This assignment is not yet delivered in the new format. Return to My Courses to continue."
      : "Your course is temporarily unavailable. Please try again shortly.";
    message.classList.add("error");
  }
})();
