/* California final examination — browser delivery.
 *
 * What this file is responsible for: showing the student why the examination is or is
 * not open, running the clock, presenting one question at a time, saving answers as
 * they are made, and submitting — on the student's action or when time runs out.
 *
 * What it is NOT responsible for, and deliberately cannot do: knowing whether an answer
 * is correct. The answer key never reaches the browser. Every response this page
 * receives has been through publicAssessment(), which strips each item to an id, a
 * prompt, and choices, so there is nothing here to leak even if the page is fully
 * inspected. The copy, print, and selection restrictions below are deterrents against
 * casual redistribution of the question text; they are not security, and are not
 * described as such anywhere a student can read.
 */

const ENDPOINT = "/.netlify/functions/student-final-exam";
const SAVE_INTERVAL_MS = 15000;

const el = (id) => document.getElementById(id);
const message = el("examMessage");
const gate = el("examGate");
const room = el("examRoom");
const resultPanel = el("examResult");
const clock = el("examClock");

const state = {
  enrollmentId: new URL(window.location.href).searchParams.get("enrollment_id") || "",
  session: null,
  items: [],
  answers: [],
  index: 0,
  expiresAt: null,
  dirty: false,
  submitting: false,
  saveTimer: null,
  clockTimer: null
};

function show(panel) {
  for (const section of [gate, room, resultPanel]) section.hidden = section !== panel;
  message.hidden = Boolean(panel);
}

function setMessage(text, isError = false) {
  message.hidden = false;
  message.textContent = text;
  message.classList.toggle("error", isError);
}

async function call(method, body) {
  const options = { method, credentials: "same-origin", headers: { accept: "application/json" } };
  if (method === "POST") {
    options.headers["content-type"] = "application/json";
    options.body = JSON.stringify({ enrollmentId: state.enrollmentId, ...body });
  }
  const url = method === "GET" ? `${ENDPOINT}?enrollment_id=${encodeURIComponent(state.enrollmentId)}` : ENDPOINT;
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(payload.error || "final_exam_unavailable"), { status: response.status });
  return payload;
}

/* Errors are shown as sentences. A student who is refused should learn what to do, and
   the two cases they can act on — an expired enrollment and a missing identity check —
   say who to contact rather than printing a code. */
const ERRORS = {
  final_exam_not_eligible: "The examination is not open yet. Return to your course to see what California still requires.",
  identity_verification_required: "A proctor must verify your photo identification immediately before the examination begins. Contact StateCourse to schedule it.",
  final_exam_attempts_exhausted: "California allows the examination and one retake. No further attempt is available.",
  final_exam_already_passed: "You have already passed this examination.",
  enrollment_expired: "California requires the course to be completed within one year of registration. This enrollment has passed that date.",
  final_exam_time_expired: "The time limit for this attempt has run out. Your answers up to that point were saved.",
  final_exam_session_closed: "This attempt has already been closed.",
  final_exam_is_student_only: "The final examination is part of a student's record and cannot be opened from a review account.",
  invalid_enrollment: "This page needs the enrollment it belongs to. Open the examination from your course."
};
const explain = (code) => ERRORS[code] || "The examination is temporarily unavailable. Please try again, or contact StateCourse if this continues.";

/* ---------- The gate ---------- */

function renderGate(payload) {
  el("gateCourse").textContent = `${payload.course.title} · version ${payload.course.version}`;
  el("factQuestions").textContent = String(payload.exam.questionCount);
  el("factPassing").textContent = `${payload.exam.passingPercent}%`;
  el("factTime").textContent = `${payload.exam.timeLimitMinutes} minutes`;
  el("factAttempts").textContent = payload.passed
    ? "Passed"
    : `${payload.exam.attemptsRemaining} of ${payload.exam.maximumAttempts} remaining`;

  const attempts = payload.attempts || [];
  el("gateHistory").hidden = attempts.length === 0;
  el("attemptList").innerHTML = attempts
    .map((attempt) => {
      const outcome = attempt.passed ? "Passed" : attempt.status === "expired" ? "Time expired" : "Not passed";
      const score = attempt.scorePercent === null || attempt.scorePercent === undefined ? "" : ` · ${attempt.scorePercent}%`;
      return `<li>Attempt ${attempt.attemptNumber}, form ${attempt.form} — <strong>${outcome}</strong>${score}</li>`;
    })
    .join("");

  const blocked = !payload.eligibility.eligible && !payload.passed;
  el("gateBlocked").hidden = !blocked;
  /* The explanations come from the server, which derives them from the same eligibility
     record the engine uses. The page never composes a requirement of its own. */
  el("requirementList").innerHTML = (payload.eligibility.remaining || [])
    .map((sentence) => `<li>${sentence}</li>`)
    .join("");

  const canStart = payload.eligibility.eligible && !payload.passed && payload.exam.attemptsRemaining > 0;
  el("gateReady").hidden = !canStart;
  el("gateTitle").textContent = payload.passed ? "Final examination — passed" : "Final examination";
  show(gate);
}

/* ---------- The examination room ---------- */

function renderQuestion() {
  const item = state.items[state.index];
  if (!item) return;
  el("questionNumber").textContent = String(state.index + 1);
  el("questionTotal").textContent = String(state.items.length);
  el("questionPrompt").textContent = item.prompt;
  el("choiceForm").innerHTML = item.choices
    .map((choice, choiceIndex) => {
      const checked = state.answers[state.index] === choiceIndex ? " checked" : "";
      return `<label class="choice"><input type="radio" name="choice" value="${choiceIndex}"${checked}>` +
        `<span class="choice-letter">${String.fromCharCode(65 + choiceIndex)}</span><span>${escapeHtml(choice)}</span></label>`;
    })
    .join("");
  el("prevQuestion").disabled = state.index === 0;
  el("nextQuestion").disabled = state.index === state.items.length - 1;
  renderGrid();
  renderCounts();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function renderGrid() {
  el("questionGrid").innerHTML = state.items
    .map((_, index) => {
      const answered = state.answers[index] !== null && state.answers[index] !== undefined;
      const current = index === state.index ? ' aria-current="true"' : "";
      return `<button type="button" data-index="${index}" data-answered="${answered}"${current}>${index + 1}</button>`;
    })
    .join("");
}

function answeredCount() {
  return state.answers.filter((answer) => answer !== null && answer !== undefined).length;
}

function renderCounts() {
  const answered = answeredCount();
  const total = state.items.length;
  el("roomAnswered").textContent = `${answered} of ${total} answered`;
  const unanswered = total - answered;
  el("submitSummary").textContent = unanswered === 0
    ? "Every question is answered. Submitting ends this attempt."
    : `${unanswered} question${unanswered === 1 ? "" : "s"} left unanswered. Unanswered questions are scored as incorrect.`;
}

function startClock() {
  const tick = () => {
    const remaining = Math.max(0, Math.floor((state.expiresAt - Date.now()) / 1000));
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;
    el("clockReadout").textContent = hours > 0
      ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${minutes}:${String(seconds).padStart(2, "0")}`;
    clock.classList.toggle("warning", remaining <= 600);
    if (remaining <= 600 && remaining > 0) el("clockNote").textContent = "The examination submits automatically at zero.";
    if (remaining === 0) {
      window.clearInterval(state.clockTimer);
      /* Time is the regulator's limit, not a prompt. The attempt submits itself with
         whatever the student has answered. */
      submit(true);
    }
  };
  tick();
  state.clockTimer = window.setInterval(tick, 1000);
  clock.hidden = false;
}

function enterRoom(session) {
  state.session = session;
  state.items = session.examination.items;
  state.answers = Array.isArray(session.answers) && session.answers.length === state.items.length
    ? session.answers.slice()
    : state.items.map(() => null);
  state.index = state.answers.findIndex((answer) => answer === null || answer === undefined);
  if (state.index < 0) state.index = 0;
  state.expiresAt = new Date(session.expiresAt).getTime();
  el("roomAttempt").textContent = String(session.attemptNumber);
  el("roomForm").textContent = session.form;
  renderQuestion();
  startClock();
  state.saveTimer = window.setInterval(() => { if (state.dirty) save(); }, SAVE_INTERVAL_MS);
  show(room);
}

async function save() {
  if (!state.session || state.submitting) return;
  state.dirty = false;
  try {
    await call("POST", { action: "save", sessionId: state.session.sessionId, answers: state.answers });
  } catch (error) {
    /* A failed save is not fatal — the answers stay in the page and the next save
       retries — but the student is told, because silence here would let them finish an
       examination believing their work was recorded. */
    state.dirty = true;
    el("submitMessage").textContent = error.message === "final_exam_time_expired"
      ? explain(error.message)
      : "Your last answers could not be saved. They are still on screen and will be sent again shortly.";
  }
}

async function submit(automatic = false) {
  if (state.submitting || !state.session) return;
  if (!automatic) {
    const unanswered = state.items.length - answeredCount();
    const warning = unanswered > 0
      ? `${unanswered} question${unanswered === 1 ? "" : "s"} are unanswered and will be scored as incorrect. Submit anyway?`
      : "Submit the examination? This ends the attempt.";
    if (!window.confirm(warning)) return;
  }
  state.submitting = true;
  el("submitExam").disabled = true;
  window.clearInterval(state.saveTimer);
  window.clearInterval(state.clockTimer);
  el("submitMessage").textContent = automatic ? "Time has run out. Submitting your answers…" : "Submitting…";
  try {
    const payload = await call("POST", { action: "submit", sessionId: state.session.sessionId, answers: state.answers });
    clock.hidden = true;
    renderResult(payload.result);
  } catch (error) {
    state.submitting = false;
    el("submitExam").disabled = false;
    el("submitMessage").textContent = explain(error.message);
  }
}

function renderResult(result) {
  el("resultHeading").textContent = result.passed ? "You passed the final examination" : "Examination submitted";
  el("resultScore").textContent = `${result.scorePercent}% · ${result.passingPercent}% required to pass`;
  el("resultMessage").textContent = result.message;
  show(resultPanel);
  resultPanel.focus?.();
}

/* ---------- Events ---------- */

el("startExam")?.addEventListener("click", async () => {
  el("startExam").disabled = true;
  el("startMessage").textContent = "Opening the examination…";
  try {
    const payload = await call("POST", { action: "start" });
    if (!payload.session) throw new Error("final_exam_start_failed");
    enterRoom(payload.session);
  } catch (error) {
    el("startExam").disabled = false;
    el("startMessage").textContent = explain(error.message);
  }
});

el("choiceForm")?.addEventListener("change", (event) => {
  const choice = Number(event.target.value);
  if (!Number.isInteger(choice)) return;
  state.answers[state.index] = choice;
  state.dirty = true;
  renderGrid();
  renderCounts();
});

el("prevQuestion")?.addEventListener("click", () => { move(state.index - 1); });
el("nextQuestion")?.addEventListener("click", () => { move(state.index + 1); });
el("gridToggle")?.addEventListener("click", () => {
  const grid = el("questionGrid");
  grid.hidden = !grid.hidden;
  el("gridToggle").setAttribute("aria-expanded", String(!grid.hidden));
});
el("questionGrid")?.addEventListener("click", (event) => {
  const index = Number(event.target?.dataset?.index);
  if (Number.isInteger(index)) { move(index); el("questionGrid").hidden = true; el("gridToggle").setAttribute("aria-expanded", "false"); }
});
el("submitExam")?.addEventListener("click", () => submit(false));

function move(index) {
  if (index < 0 || index >= state.items.length) return;
  if (state.dirty) save();
  state.index = index;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "auto" });
}

/* Copy and context-menu restrictions apply only inside the examination room, and only
   while an attempt is open. Outside it the page behaves normally. */
document.addEventListener("copy", (event) => {
  if (!room.hidden && room.contains(event.target)) event.preventDefault();
});
document.addEventListener("contextmenu", (event) => {
  if (!room.hidden && room.contains(event.target)) event.preventDefault();
});
window.addEventListener("beforeunload", (event) => {
  if (room.hidden || state.submitting) return;
  if (state.dirty) save();
  event.preventDefault();
  event.returnValue = "";
});

/* ---------- Start ---------- */

(async function open() {
  if (!state.enrollmentId) { setMessage(explain("invalid_enrollment"), true); return; }
  try {
    const payload = await call("GET");
    if (payload.openSession) {
      /* An attempt already running is resumed rather than restarted: same clock, same
         form, same answers. */
      const started = await call("POST", { action: "start" });
      if (started.session) { enterRoom(started.session); return; }
    }
    renderGate(payload);
  } catch (error) {
    setMessage(explain(error.message), true);
  }
})();
