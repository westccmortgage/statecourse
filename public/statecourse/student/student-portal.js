const message = document.querySelector("#portalMessage");
const emptyState = document.querySelector("#emptyState");
const activeGroup = document.querySelector("#activeGroup");
const completedGroup = document.querySelector("#completedGroup");
const otherGroup = document.querySelector("#otherGroup");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g,(character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[character]);
}

function money(amount,currency) {
  if (amount == null || !currency) return "Payment record pending";
  try {
    return new Intl.NumberFormat("en-US",{ style:"currency",currency:String(currency).toUpperCase() }).format(Number(amount)/100);
  } catch {
    return "Payment record available";
  }
}

function safeText(value,fallback="—") { return escapeHtml(value == null || value === "" ? fallback : value); }

function sameOriginPath(value) {
  const path = String(value || "");
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") ? path : "";
}

function date(value,fallback="Pending") {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toLocaleDateString();
}

function remainingRequirements(enrollment) {
  const requirements = Array.isArray(enrollment.remaining_requirements) ? enrollment.remaining_requirements : [];
  return requirements.length ? requirements.map((item) => safeText(item)).join(" · ") : "None currently listed";
}

function card(enrollment) {
  const progress = Math.max(0,Math.min(100,Number(enrollment.progress_percent || 0)));
  const access = enrollment.access_status === "active";
  const completed = Boolean(enrollment.completed_at) || enrollment.regulatory_credit_status === "earned";
  const resumePath = sameOriginPath(enrollment.resume_path);
  const action = access && resumePath && !completed
    ? `<a class="resume-course" href="${escapeHtml(encodeURI(resumePath))}" data-enrollment="${safeText(enrollment.enrollment_id)}">Resume course →</a>`
    : "";
  return `<article class="course-card">
    <div class="course-state"><strong>${safeText(enrollment.state)}</strong><small>${safeText(enrollment.enrollment_status)}</small></div>
    <div class="course-main">
      <p class="status">${completed ? "Completed" : safeText(enrollment.approval_status,"Course record")}</p>
      <h3>${safeText(enrollment.course_name)}</h3>
      <p class="version">Course version ${safeText(enrollment.course_version)} · Enrollment ${safeText(enrollment.enrollment_id)}</p>
      <div class="progress-track" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
      <div class="progress-label"><span>${progress}% complete</span><span>${safeText(enrollment.assignments_completed,0)}/${safeText(enrollment.assignment_count,0)} assignments</span></div>
    </div>
    <div class="course-actions">${action}<div class="course-meta"><span><strong>Registered:</strong> ${date(enrollment.enrollment_date,"Not recorded")}</span><span><strong>Quiz mastery:</strong> ${safeText(enrollment.quiz_mastery_percent,0)}%</span><span><strong>Earliest final:</strong> ${date(enrollment.earliest_final_exam_at)}</span><span><strong>Remaining:</strong> ${remainingRequirements(enrollment)}</span><span><strong>Instructor:</strong> ${safeText(enrollment.instructor_name,"Unassigned")}</span><span><strong>Help requests:</strong> ${safeText(enrollment.open_help_requests,0)}</span><span><strong>Certificate:</strong> ${safeText(enrollment.portal_certificate_status || enrollment.certificate_status)}</span><span><strong>Payment:</strong> ${safeText(enrollment.payment_status)} · ${safeText(money(enrollment.payment_amount,enrollment.payment_currency))}</span></div></div>
  </article>`;
}

function render(data) {
  const enrollments = data.enrollments || [];
  const active = enrollments.filter((item) => item.enrollment_status === "active" || item.enrollment_status === "qa_non_credit");
  const completed = enrollments.filter((item) => item.completed_at || item.regulatory_credit_status === "earned");
  const completedIds = new Set(completed.map((item) => item.enrollment_id));
  const current = active.filter((item) => !completedIds.has(item.enrollment_id));
  const other = enrollments.filter((item) => !completedIds.has(item.enrollment_id) && !active.includes(item));
  const certificateCount = enrollments.filter((item) => item.portal_certificate_status === "issued").length;
  const name = data.student?.preferred_name || data.student?.first_name || data.student?.firstName;
  document.querySelector("#studentGreeting").textContent = name ? `Welcome back, ${String(name)}` : "Your courses";
  document.querySelector("#activeCount").textContent = current.length;
  document.querySelector("#completedCount").textContent = completed.length;
  document.querySelector("#certificateCount").textContent = certificateCount;
  document.querySelector("#activeCourses").innerHTML = current.map(card).join("");
  document.querySelector("#completedCourses").innerHTML = completed.map(card).join("");
  document.querySelector("#otherCourses").innerHTML = other.map(card).join("");
  activeGroup.hidden = !current.length;
  completedGroup.hidden = !completed.length;
  otherGroup.hidden = !other.length;
  emptyState.hidden = Boolean(enrollments.length);
  message.hidden = true;
}

async function loadPortal() {
  try {
    const response = await fetch("/api/student/portal",{ credentials:"same-origin",headers:{ accept:"application/json" } });
    if (response.status === 401) {
      location.replace("/student/sign-in/?return_to=%2Fstudent%2F");
      return;
    }
    if (!response.ok) throw new Error("portal_unavailable");
    render(await response.json());
  } catch (error) {
    console.error(error);
    message.textContent = "Your student record is temporarily unavailable. Please try again later.";
    message.classList.add("error");
  }
}

document.addEventListener("click",async(event) => {
  const link = event.target.closest(".resume-course");
  if (!link) return;
  event.preventDefault();
  await fetch("/api/student/portal",{ method:"POST",credentials:"same-origin",headers:{ "content-type":"application/json" },body:JSON.stringify({ eventType:"course_resume_clicked",enrollmentId:link.dataset.enrollment }) }).catch(() => null);
  location.assign(link.href);
});

document.querySelector("#signOut").addEventListener("click",async() => {
  await fetch("/api/student/session",{ method:"DELETE",credentials:"same-origin",headers:{ "content-type":"application/json" } }).catch(() => null);
  location.replace("/student/sign-in/");
});

loadPortal();
