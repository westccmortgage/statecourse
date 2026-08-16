const contentRoot = document.body.dataset.contentRoot || "content/curriculum/";
const courseId = document.body.dataset.courseId || "va-salesperson-principles-v1";
const curriculumFiles = ["hours-01-15.md", "hours-16-30.md", "hours-31-45.md", "hours-46-60.md"].map((file) => `${contentRoot}${file}`);
const storageKeys = { reviewed: `statecourse:${courseId}:reviewer-previewed-hours`, lastHour: `statecourse:${courseId}:last-hour` };
const moduleTitles = ["Foundations of practice", "Ownership and interests", "Land use and title", "Brokerage relationships", "Contracts and agreements", "Finance fundamentals", "Mortgage lending", "Valuation and mathematics", "Listing practice", "Buyer representation", "Transaction management", "Settlement and closing", "Fair housing and disclosure", "Virginia law integration", "Professional readiness"];
const state = { hours: [], selected: 1, reviewed: new Set(), query: "", mode: "reviewer", reviewerBypass: true, complianceCreditEligible: false, completedHours: [], currentHour: 1, context: null, sessionId: null, lastInteractionAt: Date.now(), heartbeatTimer: null, sectionTimers: new Map(), feedback: "" };
const hourList = document.querySelector("#hourList");
const lessonView = document.querySelector("#lessonView");
const courseSearch = document.querySelector("#courseSearch");
const progressText = document.querySelector("#progressText");
const progressBar = document.querySelector("#progressBar");
const progressLabel = document.querySelector("#progressLabel");
const dayTrack = document.querySelector("#dayTrack");

function escapeHtml(value = "") { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function inlineMarkdown(value = "") { return escapeHtml(value).replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1 ↗</a>').replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>"); }
function formatMarkdown(value = "") {
  const cleaned = value.trim().replace(/^---$/gm, "");
  if (!cleaned) return "<p>Content is being finalized for this section.</p>";
  return cleaned.split(/\n\s*\n/).map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!lines.length) return "";
    if (lines.every((line) => line.startsWith("- "))) return `<ul>${lines.map((line) => `<li>${inlineMarkdown(line.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${lines.map(inlineMarkdown).join("<br />")}</p>`;
  }).join("");
}
function getSection(chunk, title) { const marker = `### ${title}`; const start = chunk.indexOf(marker); if (start === -1) return ""; const remainder = chunk.slice(start + marker.length); const nextHeading = remainder.search(/\n###\s/); return (nextHeading === -1 ? remainder : remainder.slice(0, nextHeading)).trim(); }
function parseHours(markdown) {
  const pattern = /^## Hour\s+(\d{2})\s+—\s+(.+)$/gm;
  const matches = [...markdown.matchAll(pattern)];
  return matches.map((match, index) => { const chunk = markdown.slice(match.index ?? 0, matches[index + 1]?.index ?? markdown.length); return { number: Number(match[1]), title: match[2].trim(), mapping: chunk.match(/\*\*Required subject mapping:\*\*\s*(.+)/)?.[1]?.trim() ?? "Course integration", objectives: getSection(chunk, "Learning objectives"), content: getSection(chunk, "Instructional content"), sequence: getSection(chunk, "50-minute instructional sequence"), check: getSection(chunk, "Scored engagement check"), remediation: getSection(chunk, "Remediation"), source: getSection(chunk, "Instructor source note"), searchText: chunk.toLowerCase() }; });
}
function questionOnly(check = "") { return check.match(/\*\*Question:\*\*\s*([\s\S]*?)(?=\n\n\*\*Expected answer|$)/i)?.[1]?.trim() || "Secure engagement item is being prepared."; }
function reviewerFallbackContext(hour = 1) {
  const primary = hour === 1 ? { id: "va-v1-h01-primary-01", prompt: "Why does the immobility of land make real estate markets local?", options: [
    { token: "review-a", label: "Because location-specific employment, infrastructure, regulation, schools, amenities, and supply affect demand and value." },
    { token: "review-b", label: "Because every parcel can be moved to a market with stronger demand." },
    { token: "review-c", label: "Because national averages always determine the value of an individual parcel." },
    { token: "review-d", label: "Because immobility prevents property ownership from being transferred." },
  ] } : null;
  return { mode: "reviewer", reviewerBypass: true, complianceCreditEligible: false, completedHours: [], currentHour: 1, courseVersion: "1.0-submission-draft", progress: { activeSeconds: 0, sectionsViewed: [], activityComplete: false, engagementComplete: false, remediationTriggered: false, remediationSatisfied: false, completedAt: null }, assessment: { primary, remediation: hour === 1 ? { explanation: "Immobility means the parcel stays in one place. Demand must come to that location, so nearby jobs, roads, services, land-use rules, amenities, and competing supply matter.", scenario: "Two physically similar homes are located in different counties with different employment, transit, services, and inventory conditions.", question: { id: "va-v1-h01-remediation-01", prompt: "Which fact best explains why the two similar homes may have different market values?", options: [{ token: "review-r-a", label: "The homes are legally required to sell for the same price." }, { token: "review-r-b", label: "Their different location-specific demand, services, regulation, and competing supply affect their separate local markets." }, { token: "review-r-c", label: "Only the national median home price may be considered." }, { token: "review-r-d", label: "Physical similarity eliminates the effect of location." }] } } : null } };
}
function loadReviewed() { try { state.reviewed = new Set(JSON.parse(localStorage.getItem(storageKeys.reviewed) || "[]").filter(Number.isInteger)); } catch { state.reviewed = new Set(); } }
function saveReviewed() { localStorage.setItem(storageKeys.reviewed, JSON.stringify([...state.reviewed].sort((a, b) => a - b))); }
function isStudent() { return state.mode === "student"; }
function isCompleted(hourNumber) { return state.completedHours.includes(hourNumber); }
function isAccessible(hourNumber) { return !isStudent() || isCompleted(hourNumber) || hourNumber === state.currentHour; }
function renderProgress() { const count = isStudent() ? state.completedHours.length : state.reviewed.size; progressLabel.textContent = isStudent() ? "Course Progress" : "Lessons reviewed in this preview"; progressText.textContent = `${count} / 60`; progressBar.style.width = `${(count / 60) * 100}%`; }
function topicCodes(mapping) { return [...new Set(mapping.match(/T\d{2}/g) ?? [])]; }
function renderDays() { dayTrack.innerHTML = Array.from({ length: 15 }, (_, index) => { const first = index * 4 + 1; return `<button class="day-button" type="button" data-day-hour="${first}"><span>Unit ${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(moduleTitles[index])}</strong><em>Hours ${String(first).padStart(2, "0")}–${String(first + 3).padStart(2, "0")}</em></button>`; }).join(""); }
function renderHourList() {
  const query = state.query.trim().toLowerCase();
  const filtered = state.hours.filter((hour) => !query || hour.title.toLowerCase().includes(query) || hour.mapping.toLowerCase().includes(query) || hour.searchText.includes(query));
  if (!filtered.length) { hourList.innerHTML = '<div class="empty-list">No course hours match this search.</div>'; return; }
  hourList.innerHTML = filtered.map((hour) => {
    const active = hour.number === state.selected; const complete = isCompleted(hour.number); const accessible = isAccessible(hour.number); const reviewed = state.reviewed.has(hour.number);
    const status = isStudent() ? (complete ? "Completed" : hour.number === state.currentHour ? "In Progress" : "Locked") : (reviewed ? "Previewed" : "Available for review");
    const symbol = isStudent() ? (complete ? "✓" : hour.number === state.currentHour ? "●" : "🔒") : (reviewed ? "✓" : "○");
    return `<button class="hour-item${active ? " active" : ""}${complete || reviewed ? " reviewed" : ""}${accessible ? "" : " locked"}" type="button" data-hour="${hour.number}" aria-current="${active}" aria-label="Hour ${hour.number}: ${escapeHtml(hour.title)} — ${status}" ${accessible ? "" : "disabled"}><span class="hour-number">${String(hour.number).padStart(2, "0")}</span><span class="hour-name">${escapeHtml(hour.title)}<span class="hour-topic">${escapeHtml(status)}</span></span><span class="hour-status" aria-hidden="true">${symbol}</span></button>`;
  }).join("");
}
function sectionTemplate(index, title, content, className = "", requiredId = "") { if (!content) return ""; return `<section class="lesson-section ${className}" ${requiredId ? `data-required-section="${requiredId}"` : ""}><h4><span class="section-index">${String(index).padStart(2, "0")}</span>${title}</h4>${formatMarkdown(content)}</section>`; }
function requirementRow(label, value, complete) { return `<li><span>${label}</span><strong class="${complete ? "complete" : "pending"}">${complete ? "Complete" : value}</strong></li>`; }
function statusPanel(progress) {
  const activeMinutes = Math.min(50, Math.floor(progress.activeSeconds / 60)); const sections = progress.sectionsViewed.length; const remediationValue = progress.remediationTriggered ? (progress.remediationSatisfied ? "Complete" : "Required") : "Not required";
  return `<section class="student-status" aria-labelledby="student-progress-title"><div class="status-heading"><div><p class="section-kicker">Your progress — Hour ${String(state.selected).padStart(2, "0")}</p><h4 id="student-progress-title">Active time: ${activeMinutes} / 50 minutes</h4></div><span>${Math.min(100, Math.floor((progress.activeSeconds / 3000) * 100))}%</span></div><div class="active-time-track" aria-label="Active instructional time ${activeMinutes} of 50 minutes"><span style="width:${Math.min(100, (progress.activeSeconds / 3000) * 100)}%"></span></div><ul>${requirementRow("Instructional content", `${sections} / 3 sections`, sections >= 3)}${requirementRow("Applied exercise", "Pending", progress.activityComplete)}${requirementRow("Engagement check", "Pending", progress.engagementComplete)}${requirementRow("Required active time", `${activeMinutes}/50 minutes`, progress.activeSeconds >= 3000)}${requirementRow("Remediation", remediationValue, !progress.remediationTriggered || progress.remediationSatisfied)}</ul><p>${progress.completedAt ? "Hour completed. The next required hour is unlocked." : "Next hour unlocks when all requirements are complete."}</p></section>`;
}
function assessmentTemplate(context) {
  const primary = context?.assessment?.primary;
  if (!primary) return `<section class="lesson-section check"><h4><span class="section-index">05</span>Scored engagement check</h4><p>${escapeHtml(questionOnly(state.hours.find((h) => h.number === state.selected)?.check))}</p><p class="assessment-note">The secure scored item for this submission-draft hour has not been published. It cannot be completed by a student.</p></section>`;
  const disabled = !isStudent();
  return `<section class="lesson-section check"><h4><span class="section-index">05</span>Scored engagement check</h4><form id="primaryAssessment"><fieldset ${disabled ? "disabled" : ""}><legend>${escapeHtml(primary.prompt)}</legend>${primary.options.map((option) => `<label class="assessment-option"><input type="radio" name="answer" value="${escapeHtml(option.token)}" required><span>${escapeHtml(option.label)}</span></label>`).join("")}</fieldset><button type="submit" ${disabled ? "disabled" : ""}>Submit answer</button></form>${disabled ? '<p class="assessment-note">Reviewer inspection: answers shown without creating an assessment attempt or student credit.</p>' : ""}<div class="assessment-feedback" id="assessmentFeedback" aria-live="polite">${escapeHtml(state.feedback)}</div></section>`;
}
function remediationTemplate(context) {
  const show = state.reviewerBypass || context?.progress?.remediationTriggered; if (!show) return ""; const remediation = context?.assessment?.remediation;
  if (!remediation?.question) return `<section class="lesson-section remediation"><h4><span class="section-index">06</span>Required remediation</h4><p>Secure remediation is not yet published for this draft hour.</p></section>`;
  const disabled = !isStudent();
  return `<section class="lesson-section remediation" id="remediationSection"><h4><span class="section-index">06</span>${isStudent() ? "Required remediation" : "Remediation inspection"}</h4><div class="remediation-copy"><h5>Alternate explanation</h5><p>${escapeHtml(remediation.explanation)}</p><h5>New scenario</h5><p>${escapeHtml(remediation.scenario)}</p></div><form id="remediationAssessment"><fieldset ${disabled ? "disabled" : ""}><legend>${escapeHtml(remediation.question.prompt)}</legend>${remediation.question.options.map((option) => `<label class="assessment-option"><input type="radio" name="answer" value="${escapeHtml(option.token)}" required><span>${escapeHtml(option.label)}</span></label>`).join("")}</fieldset><button type="submit" ${disabled ? "disabled" : ""}>Submit alternate answer</button></form></section>`;
}
function appliedActivityTemplate(progress) { return `<section class="lesson-section applied-activity"><h4><span class="section-index">04</span>Applied exercise</h4><p>Complete the applied exercise described in the instructional sequence. Record completion only after you have classified each item and reviewed your reasoning against the lesson concepts.</p><button type="button" id="completeActivity" ${!isStudent() || progress.activityComplete ? "disabled" : ""}>${progress.activityComplete ? "Applied exercise complete" : "Record applied exercise completion"}</button></section>`; }
function modeBanner() {
  if (state.reviewerBypass) return `<div class="mode-banner review-mode"><strong>Regulatory Review Mode</strong><span>Time and sequencing restrictions bypassed. Reviewer actions generate no student completion credit.</span></div>`;
  if (state.mode === "admin") return `<div class="mode-banner admin-mode"><strong>Admin Mode</strong><span>Administrative review actions are audit logged and generate no student completion credit.</span></div>`;
  return `<div class="mode-banner student-mode"><strong>Student Mode</strong><span>${state.complianceCreditEligible ? "Server-authoritative time and completion controls are active." : "Non-credit simulation: course approval or eligible enrollment is not active."}</span></div>`;
}
function renderLesson() {
  const hour = state.hours.find((item) => item.number === state.selected); if (!hour) return;
  const reviewed = state.reviewed.has(hour.number); const progress = state.context?.progress || { activeSeconds: 0, sectionsViewed: [], activityComplete: false, engagementComplete: false, remediationTriggered: false, remediationSatisfied: false, completedAt: null };
  lessonView.innerHTML = `${modeBanner()}<div class="lesson-topline"><span class="lesson-hour">Virginia course · Hour ${String(hour.number).padStart(2, "0")} of 60</span>${isStudent() ? "" : `<button class="review-button${reviewed ? " active" : ""}" type="button" id="reviewButton">${reviewed ? "Previewed" : "Mark as previewed"}</button>`}</div><h3 class="lesson-title">${escapeHtml(hour.title)}</h3><div class="topic-row">${topicCodes(hour.mapping).map((code) => `<span class="topic-badge">${escapeHtml(code)}</span>`).join("")}<span class="topic-badge">Required active instructional time: 50 minutes</span><span class="topic-badge">Course version ${escapeHtml(state.context?.courseVersion || "1.0-submission-draft")}</span></div><div class="lesson-divider"></div>${isStudent() ? statusPanel(progress) : ""}${sectionTemplate(1, "Learning objectives", hour.objectives, "", "objectives")}${sectionTemplate(2, "Instructional content", hour.content, "", "instruction")}${sectionTemplate(3, "Instructional and activity sequence", hour.sequence, "sequence", "sequence")}${appliedActivityTemplate(progress)}${assessmentTemplate(state.context)}${remediationTemplate(state.context)}${sectionTemplate(7, "Official source note", hour.source, "source-note")}<div class="lesson-support"><button type="button" id="requestHelp" ${!isStudent() ? "disabled" : ""}>Request instructor help</button><span>Repeated difficulty or a help request is added to the assigned instructor’s remediation queue.</span></div><nav class="lesson-nav" aria-label="Lesson navigation"><button type="button" data-step="-1" ${hour.number === 1 ? "disabled" : ""}>← Previous hour</button><button type="button" data-step="1" ${hour.number === 60 || (isStudent() && !progress.completedAt) ? "disabled" : ""}>${isStudent() && !progress.completedAt ? "Next hour locked" : "Next hour →"}</button></nav><p class="preview-disclaimer">${isStudent() ? "Completion is calculated automatically from server-recorded active time, content, activity, assessment, remediation, and compliance status." : "Regulatory/reviewer activity is isolated from student enrollment, instructional time, completion, and pre-license credit."}</p>`;
  document.querySelector("#reviewButton")?.addEventListener("click", () => { if (state.reviewed.has(hour.number)) state.reviewed.delete(hour.number); else state.reviewed.add(hour.number); saveReviewed(); renderProgress(); renderHourList(); renderLesson(); });
  lessonView.querySelectorAll("[data-step]").forEach((button) => button.addEventListener("click", () => selectHour(hour.number + Number(button.dataset.step))));
  document.querySelector("#completeActivity")?.addEventListener("click", () => courseAction({ action: "activity" }));
  document.querySelector("#requestHelp")?.addEventListener("click", () => courseAction({ action: "request_help" }, "Instructor help request sent."));
  document.querySelector("#primaryAssessment")?.addEventListener("submit", assessmentSubmit("primary"));
  document.querySelector("#remediationAssessment")?.addEventListener("submit", assessmentSubmit("remediation"));
  watchRequiredSections();
}
function assessmentSubmit(assessmentType) { return async (event) => { event.preventDefault(); const answerToken = new FormData(event.currentTarget).get("answer"); if (answerToken) await courseAction({ action: "assessment", assessmentType, answerToken }); }; }
async function fetchContext(hour = state.selected) {
  const response = await fetch(`/api/course?hour=${hour}`, { headers: { accept: "application/json" } }); if (!response.ok) throw new Error("Compliance context unavailable"); const context = await response.json();
  state.context = context; state.mode = context.mode; state.reviewerBypass = context.reviewerBypass; state.complianceCreditEligible = context.complianceCreditEligible; state.completedHours = context.completedHours || []; state.currentHour = context.currentHour || 1; return context;
}
async function courseAction(payload, successMessage = "") {
  try { const response = await fetch("/api/course", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, hour: state.selected, sessionId: state.sessionId }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Course update failed"); state.feedback = result.rationale || successMessage || (result.completed ? "Correct. This hour is complete and the next hour is unlocked." : "Progress recorded."); await fetchContext(state.selected); renderProgress(); renderHourList(); renderLesson(); }
  catch (error) { state.feedback = error.message; renderLesson(); }
}
function recordInteraction() { state.lastInteractionAt = Date.now(); }
function startHeartbeat() { stopHeartbeat(false); if (!isStudent()) return; state.sessionId = crypto.randomUUID(); const send = () => courseActionSilently({ action: "heartbeat", sessionId: state.sessionId, visible: document.visibilityState === "visible", focused: document.hasFocus(), connected: navigator.onLine, secondsSinceInteraction: Math.floor((Date.now() - state.lastInteractionAt) / 1000) }); send(); state.heartbeatTimer = setInterval(send, 15_000); }
async function courseActionSilently(payload) { try { const response = await fetch("/api/course", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, hour: state.selected }) }); if (!response.ok) return; const result = await response.json(); if (result.progress) { state.context.progress = result.progress; if (result.completed && !state.completedHours.includes(state.selected)) state.completedHours.push(state.selected); renderProgress(); renderHourList(); updateStatusPanelOnly(); } } catch { /* A disconnected session earns no time. */ } }
function updateStatusPanelOnly() { const panel = lessonView.querySelector(".student-status"); if (panel && state.context?.progress) panel.outerHTML = statusPanel(state.context.progress); const next = lessonView.querySelector('[data-step="1"]'); if (next && state.context?.progress?.completedAt) { next.disabled = state.selected === 60; next.textContent = "Next hour →"; } }
function stopHeartbeat(sendEnd = true) { if (state.heartbeatTimer) clearInterval(state.heartbeatTimer); state.heartbeatTimer = null; if (sendEnd && state.sessionId && isStudent()) fetch("/api/course", { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "end_session", hour: state.selected, sessionId: state.sessionId }) }).catch(() => {}); state.sessionId = null; }
function watchRequiredSections() {
  state.sectionTimers.forEach(clearTimeout); state.sectionTimers.clear(); if (!isStudent()) return;
  const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { const sectionId = entry.target.dataset.requiredSection; if (entry.isIntersecting && entry.intersectionRatio >= 0.35 && !state.context.progress.sectionsViewed.includes(sectionId)) { const timer = setTimeout(() => courseActionSilently({ action: "section", sectionId }), 4_000); state.sectionTimers.set(sectionId, timer); } else if (!entry.isIntersecting && state.sectionTimers.has(sectionId)) { clearTimeout(state.sectionTimers.get(sectionId)); state.sectionTimers.delete(sectionId); } }); }, { threshold: [0.35] });
  lessonView.querySelectorAll("[data-required-section]").forEach((element) => observer.observe(element));
  const remediation = lessonView.querySelector("#remediationSection"); if (remediation && state.context.progress.remediationTriggered && !state.context.progress.remediationContentViewed) { const remediationObserver = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.35)) setTimeout(() => courseActionSilently({ action: "remediation_view" }), 4_000); }, { threshold: [0.35] }); remediationObserver.observe(remediation); }
}
async function selectHour(number, shouldScroll = false) {
  if (!state.hours.some((hour) => hour.number === number) || !isAccessible(number)) return; stopHeartbeat(); state.selected = number; state.feedback = ""; localStorage.setItem(storageKeys.lastHour, String(number)); history.replaceState(null, "", `#hour-${String(number).padStart(2, "0")}`);
  try { await fetchContext(number); } catch { state.mode = "reviewer"; state.reviewerBypass = true; state.context = reviewerFallbackContext(number); }
  renderProgress(); renderHourList(); renderLesson(); startHeartbeat(); hourList.querySelector(".hour-item.active")?.scrollIntoView({ block: "nearest", inline: "nearest" }); if (shouldScroll) document.querySelector("#curriculum")?.scrollIntoView({ behavior: "smooth" });
}
async function loadCourse() {
  try { loadReviewed(); renderDays(); const responses = await Promise.all(curriculumFiles.map((path) => fetch(path))); if (responses.some((response) => !response.ok)) throw new Error("Curriculum file unavailable"); state.hours = (await Promise.all(responses.map((response) => response.text()))).flatMap(parseHours).sort((a, b) => a.number - b.number); if (state.hours.length !== 60) throw new Error(`Expected 60 hours; loaded ${state.hours.length}`); const requested = Number(location.hash.match(/hour-(\d{1,2})/)?.[1]) || Number(localStorage.getItem(storageKeys.lastHour)) || 1; await fetchContext(requested); state.selected = isAccessible(requested) ? requested : state.currentHour; if (state.selected !== requested) await fetchContext(state.selected); renderProgress(); renderHourList(); renderLesson(); startHeartbeat(); }
  catch (error) { console.error(error); state.mode = "reviewer"; state.reviewerBypass = true; state.selected = 1; state.context = reviewerFallbackContext(1); renderProgress(); renderHourList(); renderLesson(); }
}
hourList.addEventListener("click", (event) => { const button = event.target.closest("[data-hour]"); if (button && !button.disabled) selectHour(Number(button.dataset.hour)); });
courseSearch.addEventListener("input", () => { state.query = courseSearch.value; renderHourList(); });
dayTrack.addEventListener("click", (event) => { const button = event.target.closest("[data-day-hour]"); if (button && isAccessible(Number(button.dataset.dayHour))) selectHour(Number(button.dataset.dayHour), true); });
document.querySelectorAll("[data-open-hour]").forEach((link) => link.addEventListener("click", () => { if (state.hours.length) selectHour(1); }));
["pointerdown", "keydown", "touchstart", "scroll"].forEach((name) => window.addEventListener(name, recordInteraction, { passive: true }));
window.addEventListener("focus", recordInteraction); window.addEventListener("online", recordInteraction);
document.addEventListener("visibilitychange", () => { if (document.visibilityState !== "visible") courseActionSilently({ action: "heartbeat", sessionId: state.sessionId, visible: false, focused: false, connected: navigator.onLine, secondsSinceInteraction: Math.floor((Date.now() - state.lastInteractionAt) / 1000) }); else recordInteraction(); });
window.addEventListener("pagehide", () => stopHeartbeat());
loadCourse();
