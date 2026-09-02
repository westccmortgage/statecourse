const endpoint = "/api/admin/michigan-course";
const $ = (selector) => document.querySelector(selector);
const esc = (value = "") => String(value ?? "").replace(
  /[&<>'"]/g,
  (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char],
);
const label = (value) => String(value || "")
  .replaceAll("_", " ")
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

function when(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.valueOf())
    ? "Not recorded"
    : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function memoRows(memos = []) {
  return memos.map((memo) => `
    <tr>
      <td>${esc(label(memo.module_id))}</td>
      <td>${esc(memo.submission_version)}</td>
      <td>${esc(when(memo.submitted_at))}</td>
      <td>${esc(memo.review ? label(memo.review.outcome) : "Pending")}</td>
      <td class="mono">${esc(memo.content_sha256)}</td>
    </tr>
  `).join("") || '<tr><td colspan="5">No memo evidence.</td></tr>';
}

function moduleRows(modules = []) {
  return modules.map((item) => `
    <tr>
      <td>${esc(label(item.assignment_id))}</td>
      <td>${esc(label(item.status))}</td>
      <td>${Array.isArray(item.viewed_sections) ? item.viewed_sections.length : 0}/6</td>
      <td>${Number(item.active_seconds || 0).toLocaleString()}</td>
      <td>${item.applied_exercise_complete ? "Yes" : "No"} / ${item.engagement_check_complete ? "Yes" : "No"}</td>
    </tr>
  `).join("") || '<tr><td colspan="5">No module evidence.</td></tr>';
}

function render(data) {
  const evidence = data.evidence;
  const reasons = evidence.status?.reasons || [];
  $("#evidence").innerHTML = `
    <dl class="evidence-summary">
      <div><dt>Enrollment</dt><dd class="mono">${esc(evidence.enrollment.id)}</dd></div>
      <div><dt>Status</dt><dd>${esc(label(evidence.enrollment.status))}</dd></div>
      <div><dt>Course version</dt><dd>${esc(evidence.enrollment.course_version)}</dd></div>
      <div><dt>Completion eligible</dt><dd>${evidence.status?.completion_eligible ? "Yes" : "No"}</dd></div>
    </dl>
    <section class="evidence-section">
      <h2>Current refusal state</h2>
      <p>${esc(reasons.map(label).join(" · ") || "No completion reasons returned")}</p>
      <p><strong>Capacity:</strong> ${esc((evidence.capacity?.reasons || []).map(label).join(" · ") || "No capacity reasons returned")}</p>
    </section>
    <section class="evidence-section">
      <h2>Module evidence</h2>
      <div class="table-scroll">
        <table class="evidence-table">
          <caption class="sr-only">Module completion evidence</caption>
          <thead><tr><th scope="col">Module</th><th scope="col">Status</th><th scope="col">Sections</th><th scope="col">Active seconds</th><th scope="col">Applied / engagement</th></tr></thead>
          <tbody>${moduleRows(evidence.modules)}</tbody>
        </table>
      </div>
    </section>
    <section class="evidence-section">
      <h2>Written-memorandum ledger</h2>
      <div class="table-scroll">
        <table class="evidence-table">
          <caption class="sr-only">Immutable written-memorandum versions</caption>
          <thead><tr><th scope="col">Module</th><th scope="col">Version</th><th scope="col">Submitted</th><th scope="col">Review</th><th scope="col">SHA-256</th></tr></thead>
          <tbody>${memoRows(evidence.memos)}</tbody>
        </table>
      </div>
    </section>
    <section class="evidence-section">
      <h2>Identity and attestation events</h2>
      <p><strong>Identity events:</strong> ${esc(evidence.identity?.length || 0)} · <strong>Attestation events:</strong> ${esc(evidence.attestation?.length || 0)} · <strong>Certificates:</strong> ${esc(evidence.certificates?.length || 0)} · <strong>Reports:</strong> ${esc(evidence.reports?.length || 0)}</p>
      <p>This screen intentionally has no mutation controls.</p>
    </section>
  `;
  $("#evidence").hidden = false;
}

function showSession(signedIn) {
  $("#signInLink").hidden = signedIn;
  $("#signOut").hidden = !signedIn;
  $("#sessionState").textContent = signedIn
    ? "Named review session accepted by the server."
    : "No named review session was found.";
}

async function load(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const message = $("#evidenceMessage");
  const button = form.querySelector("button[type=submit]");
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "Loading evidence…";
  message.textContent = "Loading read-only evidence…";
  message.classList.remove("error");
  try {
    const id = $("#enrollmentId").value.trim();
    const response = await fetch(`${endpoint}?view=evidence&enrollment_id=${encodeURIComponent(id)}`, {
      credentials: "same-origin",
      headers: { accept: "application/json" },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(body.error || `request_${response.status}`);
      error.status = response.status;
      throw error;
    }
    showSession(true);
    render(body);
    message.textContent = "Read-only evidence loaded. No record was changed.";
  } catch (error) {
    if (error.status === 401) {
      showSession(false);
      message.textContent = "Sign in with the named review account, then try again.";
    } else if (error.status === 403) {
      showSession(true);
      message.textContent = "This account has no active Michigan review binding. Sign out and use the provisioned account.";
    } else {
      message.textContent = `Evidence unavailable: ${String(error.message).replaceAll("_", " ")}. Verify the enrollment identifier and try again.`;
    }
    message.classList.add("error");
    message.focus();
    $("#evidence").hidden = true;
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}

$("#evidenceLookup").addEventListener("submit", load);
$("#signOut").addEventListener("click", async () => {
  await fetch("/api/student/session", { method: "DELETE", credentials: "same-origin" }).catch(() => null);
  location.replace("/student/sign-in/?return_to=%2Fadmin%2Fmichigan-review%2F");
});
