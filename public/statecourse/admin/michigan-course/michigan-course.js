const endpoint = "/api/admin/michigan-course";
const criteria = [
  "law_accuracy",
  "fact_analysis",
  "professional_boundary",
  "action_and_timing",
  "record_and_communication",
];
const state = { records: [], selected: null };
const $ = (selector) => document.querySelector(selector);
const esc = (value = "") => String(value ?? "").replace(
  /[&<>'"]/g,
  (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char],
);
const label = (value) => String(value || "")
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function when(value) {
  if (!value) return "Unconfirmed";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf())
    ? "Unconfirmed"
    : parsed.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: "same-origin",
    headers: { ...(options.headers || {}), accept: "application/json" },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.error || `request_${response.status}`, response.status);
  return body;
}

function showSession({ signedIn, role = null }) {
  $("#signInLink").hidden = signedIn;
  $("#signOut").hidden = !signedIn;
  $("#sessionState").textContent = signedIn
    ? `Signed in with the server-bound ${label(role)} role.`
    : "No named staff session was found.";
}

function renderCapacity(capacity = {}) {
  $("#capacity").hidden = false;
  $("#capacity").innerHTML = `
    <article><strong>${esc(capacity.active_students ?? 0)}</strong><span>Active students</span></article>
    <article><strong>${esc(capacity.active_student_cap ?? "Draft")}</strong><span>Proposed cap</span></article>
    <article><strong>${esc(capacity.pending_memo_reviews ?? 0)}</strong><span>Pending reviews</span></article>
    <article><strong>${esc(capacity.overdue_memo_reviews ?? 0)}</strong><span>Overdue reviews</span></article>
    <article><strong>${capacity.checkout_allowed ? "Open" : "Closed"}</strong><span>Checkout decision</span></article>
    <p class="gate-reasons"><strong>Blocking reasons:</strong> ${esc((capacity.reasons || []).map(label).join(" · ") || "None")}. Wait-list entries never authorize a charge.</p>
  `;
}

function renderQueue() {
  const area = $("#queueRecords");
  area.innerHTML = state.records.length
    ? state.records.map((row) => `
      <button type="button" class="queue-record" data-id="${esc(row.submission_id)}" aria-pressed="${row.submission_id === state.selected?.submission_id}">
        <strong>${esc(label(row.module_id))} · version ${esc(row.submission_version)}</strong>
        <small>Enrollment ${esc(row.enrollment_id)}</small>
        <small class="${row.sla_state === "overdue" ? "overdue" : ""}">${esc(label(row.sla_state))} · due ${esc(when(row.review_due_at))}</small>
      </button>
    `).join("")
    : '<p class="empty-copy queue-empty">No pending Michigan memorandum reviews.</p>';
}

function renderReview() {
  const row = state.selected;
  if (!row) {
    $("#reviewPanel").innerHTML = '<p class="empty-copy">Choose a pending memorandum to review.</p>';
    return;
  }
  $("#reviewPanel").innerHTML = `
    <p class="eyebrow">Immutable submission</p>
    <h2>${esc(label(row.module_id))} · version ${esc(row.submission_version)}</h2>
    <div class="record-line">
      <span class="tag">Submitted ${esc(when(row.submitted_at))}</span>
      <span class="tag">${esc(label(row.sla_state))}</span>
      <span class="tag mono">SHA-256 ${esc(row.content_sha256)}</span>
    </div>
    <h3>Student memorandum</h3>
    <p class="memo-text">${esc(row.response_text)}</p>
    <form id="rubricForm" class="rubric-form">
      <p class="field-help">Score every criterion from 0 to 2 and provide specific feedback. The server derives satisfactory or needs revision; the browser cannot choose the outcome or reviewer identity.</p>
      ${criteria.map((key) => `
        <section class="criterion">
          <h3>${esc(label(key))}</h3>
          <label for="score-${key}">Score
            <select id="score-${key}" name="score:${key}" required>
              <option value="">Choose</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </label>
          <label for="feedback-${key}">Criterion feedback
            <textarea id="feedback-${key}" name="feedback:${key}" required></textarea>
          </label>
        </section>
      `).join("")}
      <div class="rubric-actions">
        <button type="submit">Record immutable review</button>
        <p id="reviewMessage" class="form-message" role="status" aria-live="polite" tabindex="-1"></p>
      </div>
    </form>
  `;
  $("#rubricForm").addEventListener("submit", submitReview);
  $("#reviewPanel").focus();
}

async function submitReview(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const scores = {};
  const feedback = {};
  for (const key of criteria) {
    scores[key] = Number(data.get(`score:${key}`));
    feedback[key] = String(data.get(`feedback:${key}`) || "").trim();
  }
  const message = $("#reviewMessage");
  const firstEmpty = criteria.find((key) => !feedback[key]);
  if (firstEmpty) {
    message.textContent = `Provide feedback for ${label(firstEmpty)}.`;
    $(`#feedback-${firstEmpty}`).focus();
    return;
  }
  const button = form.querySelector("button[type=submit]");
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "Recording review…";
  message.textContent = "Recording through the server-bound instructor identity…";
  try {
    await api(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventType: "review_memo",
        submissionId: state.selected.submission_id,
        scores,
        feedback,
      }),
    });
    message.textContent = "Review recorded.";
    state.selected = null;
    await loadQueue();
  } catch (error) {
    message.textContent = `Review refused: ${String(error.message).replaceAll("_", " ")}. Check the named instructor binding and try again.`;
    message.focus();
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

async function loadQueue() {
  const message = $("#queueMessage");
  message.textContent = "Loading protected Michigan records…";
  message.classList.remove("error");
  $("#workArea").hidden = true;
  $("#capacity").hidden = true;
  try {
    const body = await api(`${endpoint}?view=queue`);
    showSession({ signedIn: true, role: body.actorRole });
    state.records = body.records || [];
    renderCapacity(body.capacity);
    renderQueue();
    renderReview();
    $("#workArea").hidden = false;
    message.textContent = `${state.records.length} pending review${state.records.length === 1 ? "" : "s"}. Enrollment remains ${body.capacity?.enrollment_allowed ? "conditionally eligible under the recorded gates" : "closed"}.`;
  } catch (error) {
    state.records = [];
    state.selected = null;
    if (error.status === 401) {
      showSession({ signedIn: false });
      message.textContent = "Sign in with the named instructor account to open the queue.";
    } else if (error.status === 403) {
      showSession({ signedIn: true, role: "unbound" });
      message.textContent = "This signed-in account has no active Michigan instructor binding. Sign out, then use the provisioned instructor account.";
    } else {
      message.textContent = `Queue unavailable: ${String(error.message).replaceAll("_", " ")}. Try again or verify the server configuration.`;
    }
    message.classList.add("error");
    message.focus();
  }
}

$("#queueRecords").addEventListener("click", (event) => {
  const button = event.target.closest("[data-id]");
  if (!button) return;
  state.selected = state.records.find((row) => row.submission_id === button.dataset.id) || null;
  renderQueue();
  renderReview();
});

$("#signOut").addEventListener("click", async () => {
  await fetch("/api/student/session", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
  location.replace("/student/sign-in/?return_to=%2Fadmin%2Fmichigan-course%2F");
});

loadQueue();
