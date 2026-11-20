/* One script, two pages. /student/ is My StateCourse: credit courses, purchases, progress
   and certificates. /student/free-training/ is the separate free-practice section. The
   server decides which enrollments belong to which; this script only draws them. */
const section = document.body.dataset.portalSection === "free-training" ? "free-training" : "main";
const portalApi = section === "free-training" ? "/api/student/portal?section=free-training" : "/api/student/portal";
const portalPath = section === "free-training" ? "/student/free-training/" : "/student/";
const message = document.querySelector("#portalMessage");
const emptyState = document.querySelector("#emptyState");
const activeGroup = document.querySelector("#activeGroup");
const completedGroup = document.querySelector("#completedGroup");
const otherGroup = document.querySelector("#otherGroup");
const profileCompletion = document.querySelector("#profileCompletion");
const profileNameForm = document.querySelector("#profileNameForm");
const profileFormMessage = document.querySelector("#profileFormMessage");
const nmlsIdentity = document.querySelector("#nmlsIdentity");
const nmlsIdentityForm = document.querySelector("#nmlsIdentityForm");
const nmlsIdInput = document.querySelector("#nmlsIdInput");
const nmlsIdentityMessage = document.querySelector("#nmlsIdentityMessage");
const nmlsIdentitySubmit = document.querySelector("#nmlsIdentitySubmit");

/* One sentence per refusal the server can return, so a learner is told what to change
   rather than that something went wrong. Keys match config/nmls/student-identifier.mjs. */
const NMLS_ID_MESSAGES = {
  nmls_id_empty: "Enter your NMLS ID, or leave this section if you do not have one yet.",
  nmls_id_not_digits: "An NMLS ID is digits only. Remove any letters, spaces or punctuation.",
  nmls_id_too_long: "That is longer than any NMLS ID. Check the number on your NMLS record.",
};

function showNmlsIdentity(state) {
  if (!nmlsIdentity) return;
  nmlsIdentity.hidden = false;
  const present = Boolean(state?.present);
  /* The saved number is placed in the field itself, so correcting a typo means editing
     what is there rather than retyping it from memory. */
  nmlsIdInput.value = present ? String(state.value ?? "") : "";
  nmlsIdentitySubmit.textContent = present ? "Update" : "Save";
}

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

function deploySafeResumePath(value) {
  const path = sameOriginPath(value);
  return path.replace(/^\/student\/course\/?\?/,"/student-course.html?");
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

function displayName(student = {}) {
  return String(student.preferred_name || student.first_name || student.firstName || "").trim().replace(/[\u0000-\u001f\u007f]/g,"").slice(0,100);
}

function personalize(student = {}) {
  const name = displayName(student);
  const greeting = document.querySelector("#studentGreeting");
  if (greeting) greeting.textContent = name ? `Welcome back, ${name}.` : "Welcome back.";
  const accountName = document.querySelector("#studentAccountName");
  accountName.textContent = name;
  accountName.hidden = !name;
  if (profileCompletion) profileCompletion.hidden = Boolean(name);
}

/* The NMLS reviewers' credit version. It carries none of the free-training labels, and
   it states nothing about credit, certificates or payment either way. */
function creditReviewCard(enrollment) {
  const open = enrollment.credit_review.version === "open";
  const progress = Math.max(0,Math.min(100,Number(enrollment.progress_percent || 0)));
  const available = enrollment.nmls_training?.available === true;
  const resumePath = sameOriginPath(enrollment.resume_path);
  const completed = !open && enrollment.training_completed === true;
  const action = enrollment.access_status === "active" && resumePath && available
    ? `<a class="resume-course" href="${escapeHtml(encodeURI(resumePath))}" data-enrollment="${safeText(enrollment.enrollment_id)}">${open ? "Open course" : completed ? "View course result" : "Resume course"} →</a>` : "";
  return `<article class="course-card" data-credit-review="${open ? "open" : "closed"}">
    <div class="course-state"><strong>${safeText(enrollment.state)}</strong><small>${safeText(enrollment.enrollment_status)}</small></div>
    <div class="course-main">
      <p class="status">NMLS reviewer access · ${open ? "open version" : "student version"} · application ${safeText(enrollment.credit_review.applicationId)}</p>
      <h3>${safeText(enrollment.course_name)}</h3>
      <p class="version">Course version ${safeText(enrollment.course_version)} · Enrollment ${safeText(enrollment.enrollment_id)}</p>
      ${!available ? "<p>Saved course progress is temporarily unavailable. This does not mean your work was lost. Reload to check again.</p>" : open ? "<p>Every lesson and module quiz can be opened in any order. No study time or completion is recorded.</p>" : `<div class="progress-track" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>
      <div class="progress-label"><span>${progress}% complete</span><span>${safeText(enrollment.assignments_completed,0)}/${safeText(enrollment.assignment_count,0)} lessons</span></div>`}
    </div>
    <div class="course-actions">${action}<div class="course-meta"><span><strong>Registered:</strong> ${date(enrollment.enrollment_date,"Not recorded")}</span>${open || !available ? "" : `<span><strong>Module quizzes:</strong> ${safeText(enrollment.nmls_training.passedModules,0)}/${safeText(enrollment.nmls_training.totalModules,0)} passed</span>`}<span><strong>Remaining:</strong> ${remainingRequirements(enrollment)}</span></div></div>
  </article>`;
}

function card(enrollment) {
  if (enrollment.credit_review) return creditReviewCard(enrollment);
  const training=enrollment.enrollment_origin==='training';
  const mortgageTraining=training&&enrollment.course_id==='nmls-ce-2026-comprehensive-8';
  const mortgageProgress=enrollment.nmls_training;
  const mortgageUnavailable=mortgageTraining&&mortgageProgress?.available!==true;
  const mortgageReadOnly=mortgageTraining&&mortgageProgress?.readOnly===true;
  const review=enrollment.enrollment_origin==='review';
  const progress = Math.max(0,Math.min(100,Number(enrollment.progress_percent || 0)));
  const access = enrollment.access_status === "active";
  const completed = mortgageTraining ? !mortgageReadOnly&&enrollment.training_completed===true : Boolean(enrollment.completed_at) || enrollment.regulatory_credit_status === "earned";
  const resumePath = deploySafeResumePath(enrollment.resume_path);
  const action = access && resumePath && !mortgageUnavailable && (!completed||mortgageTraining)
    ? `<a class="resume-course" href="${escapeHtml(encodeURI(resumePath))}" data-enrollment="${safeText(enrollment.enrollment_id)}">${mortgageReadOnly?'Open review':mortgageTraining?(completed?'View training result':'Resume training'):'Resume course'} →</a>`
    : "";
  return `<article class="course-card">
    <div class="course-state"><strong>${safeText(enrollment.state)}</strong><small>${safeText(enrollment.enrollment_status)}</small></div>
    <div class="course-main">
      <p class="status">${mortgageReadOnly?'Read-only regulator review · no NMLS credit':training?(completed?'Course training completed · no licensing or NMLS credit':'Training purposes · no licensing or NMLS credit'):review?'Review access · no licensing credit':completed ? "Completed" : safeText(enrollment.approval_status,"Course record")}</p>
      <h3>${safeText(enrollment.course_name)}</h3>
      <p class="version">Course version ${safeText(enrollment.course_version)} · Enrollment ${safeText(enrollment.enrollment_id)}</p>
      ${mortgageUnavailable?'<p>Saved training progress is temporarily unavailable. This does not mean your work was lost. Reload to check again.</p>':mortgageReadOnly?'<p>Browse all lessons and module questions without changing training records. No completion or study time is recorded.</p>':`${mortgageTraining?`<progress class="mortgage-training-progress" aria-label="Training progress" max="100" value="${progress}">${progress}%</progress>`:`<div class="progress-track" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><span style="width:${progress}%"></span></div>`}
      <div class="progress-label"><span>${progress}% ${mortgageTraining?'training progress':'complete'}</span><span>${safeText(enrollment.assignments_completed,0)}/${safeText(enrollment.assignment_count,0)} ${mortgageTraining?'units':'assignments'}</span></div>`}
    </div>
    <div class="course-actions">${action}<div class="course-meta"><span><strong>Registered:</strong> ${date(enrollment.enrollment_date,"Not recorded")}</span>${mortgageTraining?`${mortgageReadOnly?'':`<span><strong>Module practices:</strong> ${mortgageUnavailable?'Unavailable':`${safeText(mortgageProgress.passedModules,0)}/${safeText(mortgageProgress.totalModules,0)} passed`}</span><span><strong>Remaining training:</strong> ${mortgageUnavailable?'Unavailable':remainingRequirements(enrollment)}</span>`}<span><strong>NMLS credit:</strong> Not issued — ${mortgageReadOnly?'read-only review':'free training only'}</span><span><strong>Payment:</strong> ${mortgageReadOnly?'Review access':'Free training'} — no payment</span>`:`<span><strong>Quiz mastery:</strong> ${safeText(enrollment.quiz_mastery_percent,0)}%</span><span><strong>Earliest final:</strong> ${date(enrollment.earliest_final_exam_at)}</span><span><strong>Remaining:</strong> ${remainingRequirements(enrollment)}</span><span><strong>Instructor:</strong> ${safeText(enrollment.instructor_name,"Unassigned")}</span><span><strong>Help requests:</strong> ${safeText(enrollment.open_help_requests,0)}</span><span><strong>Certificate:</strong> ${safeText(enrollment.portal_certificate_status || enrollment.certificate_status)}</span><span><strong>Payment:</strong> ${training ? "Free training — no payment" : review ? "Review access — no payment" : safeText(enrollment.payment_status)+" · "+safeText(money(enrollment.payment_amount,enrollment.payment_currency))}</span>`}</div></div>
  </article>`;
}

function render(data) {
  const enrollments = data.enrollments || [];
  const active = enrollments.filter((item) => item.enrollment_status === "active" || item.enrollment_status === "qa_non_credit");
  const completed = enrollments.filter((item) => item.course_id==='nmls-ce-2026-comprehensive-8'&&item.enrollment_origin==='training'?item.training_completed===true&&item.credit_review?.version!=='open':item.completed_at || item.regulatory_credit_status === "earned");
  const completedIds = new Set(completed.map((item) => item.enrollment_id));
  const current = active.filter((item) => !completedIds.has(item.enrollment_id));
  const other = enrollments.filter((item) => !completedIds.has(item.enrollment_id) && !active.includes(item));
  const certificateCount = enrollments.filter((item) => item.portal_certificate_status === "issued").length;
  const training=data.training;
  const existing=new Set(enrollments.filter(e=>['active','qa_non_credit'].includes(e.enrollment_status)).map(e=>e.course_id));
  const available=(training?.courses||[]).filter(course=>!existing.has(course.id));
  const group=document.querySelector('#trainingGroup');
  if(group){
    group.hidden=training?.available!==false&&!available.length;
    document.querySelector('#trainingMessage').textContent=training?.available===false?'Available training courses could not be checked. Reload to try again.':'';
    document.querySelector('#trainingCourses').innerHTML=available.map(c=>`<article class="course-card"><div class="course-state"><strong>${escapeHtml(c.state)}</strong><small>Free practice</small></div><div class="course-main"><p class="status">Free training · no licensing credit</p><h3>${escapeHtml(c.name)}</h3><p>No payment and no licensing credit.</p></div><div class="course-actions"><button type="button" data-training-course="${escapeHtml(c.id)}">Start free training</button></div></article>`).join('');
  }
  personalize(data.student);
  if (section === "main") {
    showNmlsIdentity(data.nmlsIdentity);
    document.querySelector("#certificateCount").textContent = certificateCount;
    /* The link to the free section is always shown; the count says whether anything is there. */
    const count = Number(data.freeTraining?.enrollmentCount || 0);
    document.querySelector("#freeTrainingSummary").textContent = count
      ? `You have ${count} free practice ${count === 1 ? "course" : "courses"} in progress or on record.`
      : "Free practice courses are listed separately from your credit courses.";
  }
  document.querySelector("#activeCount").textContent = current.length;
  document.querySelector("#completedCount").textContent = completed.length;
  document.querySelector("#activeCourses").innerHTML = current.map(card).join("");
  document.querySelector("#completedCourses").innerHTML = completed.map(card).join("");
  document.querySelector("#otherCourses").innerHTML = other.map(card).join("");
  activeGroup.hidden = !current.length;
  completedGroup.hidden = !completed.length;
  otherGroup.hidden = !other.length;
  emptyState.hidden = Boolean(enrollments.length) || (section === "free-training" && available.length > 0);
  message.hidden = true;
}

async function loadPortal() {
  try {
    const response = await fetch(portalApi,{ credentials:"same-origin",headers:{ accept:"application/json" } });
    if (response.status === 401) {
      location.replace(`/student/sign-in/?return_to=${encodeURIComponent(portalPath)}`);
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

profileNameForm?.addEventListener("submit",async(event) => {
  event.preventDefault();
  profileFormMessage.textContent = "Saving your name…";
  const button = profileNameForm.querySelector("button");
  button.disabled = true;
  try {
    const input = Object.fromEntries(new FormData(profileNameForm));
    const response = await fetch("/api/student/portal",{
      method:"PATCH",
      credentials:"same-origin",
      headers:{ "content-type":"application/json",accept:"application/json" },
      body:JSON.stringify(input)
    });
    if (!response.ok) throw new Error("profile_update_failed");
    const result = await response.json();
    personalize(result.student);
    profileFormMessage.textContent = "Your name has been saved.";
  } catch (error) {
    console.error(error);
    profileFormMessage.textContent = "We could not save your name. Please check both fields and try again.";
  } finally {
    button.disabled = false;
  }
});

nmlsIdentityForm?.addEventListener("submit",async(event) => {
  event.preventDefault();
  nmlsIdentityMessage.textContent = "Saving your NMLS ID…";
  nmlsIdentitySubmit.disabled = true;
  try {
    const response = await fetch("/api/student/portal",{
      method:"PATCH",
      credentials:"same-origin",
      headers:{ "content-type":"application/json",accept:"application/json" },
      /* Only the identifier is sent. The name is a separate correction and resending it
         here would overwrite it with whatever happens to be on screen. */
      body:JSON.stringify({ nmlsId:nmlsIdInput.value })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      /* A refusal the learner can act on is shown as such; anything else is a fault on
         our side and must not be dressed up as their mistake. */
      nmlsIdentityMessage.textContent = NMLS_ID_MESSAGES[result.error]
        || "We could not save your NMLS ID just now. Please try again shortly.";
      return;
    }
    showNmlsIdentity(result.nmlsIdentity);
    nmlsIdentityMessage.textContent = "Your NMLS ID has been saved.";
  } catch (error) {
    console.error(error);
    nmlsIdentityMessage.textContent = "We could not save your NMLS ID just now. Please try again shortly.";
  } finally {
    nmlsIdentitySubmit.disabled = false;
  }
});

document.addEventListener("click",async(event) => {
  const trainingButton=event.target.closest('[data-training-course]');
  if(trainingButton){
    if(trainingButton.disabled)return;
    trainingButton.disabled=true;
    const status=document.querySelector('#trainingMessage');status.textContent='Opening your training course…';
    try{
      const res=await fetch('/api/enroll/training',{method:'POST',credentials:'same-origin',headers:{'content-type':'application/json'},body:JSON.stringify({courseId:trainingButton.dataset.trainingCourse})});
      const body=await res.json();
      if(!res.ok)throw new Error(body.error||'training_unavailable');
      const path=sameOriginPath(body.href);if(!path)throw new Error('training_unavailable');
      location.assign(path);
    }catch(error){status.textContent=error.message==='training_access_revoked'||error.message==='existing_training_access_inactive'?'This enrollment is inactive. Contact StateCourse to review your access.':'The training course could not be opened. Reload and try again.';trainingButton.disabled=false;}
    return;
  }
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
