const body = document.querySelector("#queueBody");
const message = document.querySelector("#queueMessage");
const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

async function loadQueue() {
  try {
    const response = await fetch("/api/instructor/remediation", { headers: { accept: "application/json" } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to load instructor queue");
    const records = result.records || [];
    message.textContent = `${records.length} remediation ${records.length === 1 ? "record" : "records"}`;
    body.innerHTML = records.length ? records.map((row) => `<tr><td><strong>${escapeHtml(row.student_email)}</strong><small>${escapeHtml(row.student_id)}</small></td><td><strong>Virginia Principles & Practices</strong><small>${escapeHtml(row.course_version)}</small></td><td>${String(row.hour_id).padStart(2, "0")}</td><td>${escapeHtml(row.concept)}</td><td>${row.attempts}</td><td>${escapeHtml(row.last_activity_at)}</td><td>${row.help_requested ? "Yes" : "No"}</td><td>${escapeHtml(row.status)}</td></tr>`).join("") : '<tr><td colspan="8">No students currently require instructor intervention.</td></tr>';
  } catch (error) {
    message.textContent = error.message;
    body.innerHTML = '<tr><td colspan="8">The queue is unavailable for this account.</td></tr>';
  }
}
loadQueue();
