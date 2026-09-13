import { ReviewClient, postReview } from './review-client.mjs';
import { escapeHtml as esc, renderLessonMarkdown } from './lesson-markdown.mjs';
import { presentOptions } from './question-presentation.mjs';

const el = (id) => document.getElementById(id);
const errors = {
  connection_interrupted: 'Connection interrupted. Time and the last action are not confirmed. Your answers remain on this page. Retry safely before continuing.',
  nmls_review_revision_conflict: 'The saved review changed, possibly on another device. Reload it, then explicitly resume here if you intend to take over.',
  nmls_review_session_conflict: 'This device no longer owns the study session. Reload your saved review to continue here.',
  nmls_review_idempotency_conflict: 'This action could not be safely reconciled. Reload your saved review.',
  course_logout_required: 'Your review session ended. Completed units remain saved; the unfinished unit and quiz must be restarted.',
  nmls_review_access_denied: 'Review access has expired or is no longer assigned to this account.',
  nmls_review_content_changed: 'This assigned version has changed. Ask StateCourse for a new review assignment.',
  nmls_review_course_not_found: 'This review version is not available.',
  invalid_answer_set: 'Answer every question before submitting the module review.',
  unit_requirements_unmet: 'Complete the unit activity and its required review time before continuing.',
};
let catalogEpoch = 0, selectedUnit = null, contentKey = '', outlineKey = '', feedbackKey = '';
let nextCommand = null, lastGesture = 0, locallyIdle = false, idleTimer;
const client = new ReviewClient({ onChange: render, onRenderError: () => {
  clearTimeout(idleTimer); clearReading();
  el('syncStatus').textContent = 'The learning interface could not be displayed safely. Reload this page to retrieve saved progress.';
} });
const units = (p) => p.modules.flatMap((m) => m.units.map((u) => ({ ...u, moduleId: m.id })));
const time = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
const active = () => client.view.progress?.status === 'active' && Boolean(client.view.progress.sessionId);
const usable = () => active() && !locallyIdle && ['ready', 'busy'].includes(client.view.phase);
const actionBusy = () => Boolean(client.view.foregroundPending);
const currentMaterialVisible = () => !document.hidden && !locallyIdle &&
  Boolean(client.view.progress?.quiz || (client.view.progress?.currentUnitId && selectedUnit === client.view.progress.currentUnitId));
function resetIdle() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (!active()) return;
    locallyIdle = true; render(client.view);
    // No pre-logout warning or client-side time award. The next server request
    // persists the actual expiry; local locking alone is not saved evidence.
    if (client.view.phase === 'ready') client.send('heartbeat', { visible: false }, { background: true });
  }, 360000);
}
function clearReading() {
  contentKey = ''; outlineKey = ''; feedbackKey = ''; selectedUnit = null;
  el('lesson').replaceChildren(); el('questionArea').replaceChildren(); el('quizArea').replaceChildren();
  el('feedbackArea').replaceChildren();
  for (const id of ['questionArea', 'quizArea', 'feedbackArea', 'unitMeta', 'nextArea']) el(id).hidden = true;
}
function signInLink(anchor) {
  const path = `/student/nmls-review/${location.search}`;
  anchor.href = `/student/sign-in/?return_to=${encodeURIComponent(path)}`;
}
function question(q, name, number = '') {
  return `<fieldset><legend>${number ? `${number}. ` : ''}${esc(q.stem)}</legend><p class="fine-print">Choices may appear in a different order; letters stay attached to the same response.</p>${presentOptions(q.options).map((option) =>
    `<label class="answer"><input type="radio" name="${esc(name)}" value="${esc(option.id)}" required><span>${esc(option.displayLabel)}. ${esc(option.text)}</span></label>`).join('')}</fieldset>`;
}
function renderFeedback(feedback) {
  const key = JSON.stringify(feedback);
  if (key === feedbackKey) return;
  feedbackKey = key;
  const area = el('feedbackArea'); area.hidden = !feedback;
  if (!feedback) { area.replaceChildren(); return; }
  const sources = (item) => (item.sourceUrls || []).filter((url) => /^https:\/\//.test(url))
    .map((url, index) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source ${index + 1}</a>`).join(' · ');
  if (feedback.kind === 'module_quiz') {
    area.innerHTML = `<h2>${feedback.passed ? 'Module review passed' : 'Review and try again'}: ${feedback.correct} of ${feedback.total} correct</h2><p>This is a development review result, not an NMLS examination or credit.</p><ol>${feedback.items.map((item) => `<li><strong>${item.correct ? 'Correct' : 'Needs review'}.</strong> ${esc(item.rationale)}<p>${sources(item)}</p></li>`).join('')}</ol>`;
  } else area.innerHTML = `<h2>${feedback.correct ? 'Correct — activity recorded' : 'Review the explanation and try again'}</h2><p>${esc(feedback.rationale)}</p><p>${sources(feedback)}</p>`;
}
function render(view) {
  const p = view.progress;
  el('catalog').hidden = Boolean(view.grant); el('study').hidden = !view.grant;
  if (!view.grant) return;
  el('courseTitle').textContent = p?.title || view.grant.title || 'Private review';
  let status = 'Saved. Completed units are retained; the current unit is provisional until completed.';
  if (view.phase === 'loading') status = 'Loading your saved review…';
  if (view.phase === 'busy') status = 'Saving review activity…';
  if (view.phase === 'auth') status = 'Your account session ended. Sign in again. This page no longer shows the private lesson.';
  if (view.error) status = errors[view.error] || (view.error === 'review_answer_incorrect' ? 'Your answer was recorded. Read the explanation below.' : 'The last action could not be completed. Review the instructions below.');
  if (view.code === 'course_logged_out') status = 'Review exited. Completed units remain saved; the unfinished unit was reset.';
  if (view.phase === 'ready' && !p?.sessionId && p?.status !== 'review_complete' && !view.error) status = 'Saved progress loaded. Choose “Start or resume review” to use this device.';
  if (locallyIdle && active() && ['ready', 'busy'].includes(view.phase)) status = 'The inactivity limit has been reached. Study is paused while the server confirms the session state.';
  el('syncStatus').textContent = status;
  el('syncStatus').parentElement.dataset.error = String(Boolean(view.error) || locallyIdle);
  el('retryCommand').hidden = view.phase !== 'uncertain';
  el('reloadReview').hidden = !['recover', 'uncertain'].includes(view.phase);
  el('studySignIn').hidden = view.phase !== 'auth'; signInLink(el('studySignIn'));
  el('exitReview').hidden = !active(); el('exitReview').disabled = !usable() || actionBusy();
  el('resumePanel').hidden = !p || Boolean(p.sessionId) || p.status === 'review_complete' || !['ready', 'busy'].includes(view.phase);
  el('resumeReview').disabled = view.phase !== 'ready';
  el('reviewFinished').hidden = p?.status !== 'review_complete';
  if (!p || ['auth', 'denied', 'recover'].includes(view.phase)) {
    clearReading(); el('outline').replaceChildren(); el('savedSummary').textContent = ''; return;
  }
  if (p.status !== 'active' || !p.sessionId) { clearTimeout(idleTimer); locallyIdle = false; }
  const all = units(p);
  el('savedSummary').textContent = `${p.completedUnitIds.length} of ${all.length} units saved · ${time(p.completedReviewMs)} review time`;
  const firstIncomplete = all.find((u) => !p.completedUnitIds.includes(u.id));
  const current = all.find((u) => u.id === p.currentUnitId);
  if (!selectedUnit || (!p.completedUnitIds.includes(selectedUnit) && selectedUnit !== p.currentUnitId)) selectedUnit = p.currentUnitId;
  if (!p.sessionId && !p.completedUnitIds.includes(selectedUnit)) selectedUnit = null;
  const navigationKey = JSON.stringify([p.completedUnitIds, p.passedModuleIds, p.currentUnitId, selectedUnit, p.status, Boolean(p.sessionId), view.phase === 'uncertain', locallyIdle, actionBusy()]);
  if (outlineKey !== navigationKey) {
    outlineKey = navigationKey;
    el('outline').innerHTML = p.modules.map((m) => `<h2>${esc(m.title)}</h2><ol>${m.units.map((u) => {
      const done = p.completedUnitIds.includes(u.id); const opened = u.id === p.currentUnitId;
      const allowed = !['uncertain', 'recover'].includes(view.phase) && !actionBusy() &&
        (done || (usable() && (opened || firstIncomplete?.id === u.id) && !p.quiz));
      return `<li><button type="button" data-unit="${esc(u.id)}" ${u.id === selectedUnit ? 'aria-current="step"' : ''} ${allowed ? '' : 'disabled'}>${esc(u.title)}<small>${done ? 'Saved' : opened ? 'In progress' : 'Not completed'} · ${Math.ceil(u.requiredSeconds / 60)} min</small></button></li>`;
    }).join('')}</ol><p class="fine-print">Module questions: ${p.passedModuleIds.includes(m.id) ? 'Passed in review' : 'After all units'}</p>`).join('');
  }
  const lesson = p.lessons.find((item) => item.id === selectedUnit);
  const showQuiz = Boolean(p.quiz && active());
  const key = `${view.attemptId}:${p.contentDigest}:${showQuiz ? `quiz:${p.quiz.id}` : `unit:${lesson?.id || ''}:${lesson?.id === p.currentUnitId && active()}`}`;
  // Timer responses update text only. Forms, selected radios, focus and scroll
  // remain untouched until the actual unit/quiz/session changes.
  if (contentKey !== key) {
    const wasContent = contentKey;
    contentKey = key;
    el('lesson').innerHTML = !showQuiz && lesson ? renderLessonMarkdown(lesson.content) : '';
    el('questionArea').hidden = showQuiz || !lesson || lesson.id !== p.currentUnitId || !active();
    el('questionArea').innerHTML = !el('questionArea').hidden ? `<h2>Apply what you read</h2><form id="unitForm">${question(lesson.question, 'choice')}<button type="submit">Check my answer</button></form>` : '';
    el('quizArea').hidden = !showQuiz;
    el('quizArea').innerHTML = showQuiz ? `<h2>Module review</h2><p>Answer all ${p.quiz.questions.length} questions. The server grades your responses. An 80% review score is required to pass this development module.</p><form id="quizForm">${p.quiz.questions.map((q, i) => question(q, q.id, i + 1)).join('')}<button type="submit">Submit module review</button></form>` : '';
    if (wasContent && (showQuiz || lesson)) {
      const heading = (showQuiz ? el('quizArea') : el('lesson')).querySelector('h2, h3');
      if (heading) { heading.tabIndex = -1; heading.focus(); }
    }
  }
  el('unitMeta').hidden = showQuiz || !lesson;
  if (lesson) {
    el('unitPosition').textContent = `Unit ${all.findIndex((u) => u.id === lesson.id) + 1} of ${all.length}`;
    el('unitTime').textContent = lesson.id === p.currentUnitId ? `${time(p.provisionalReviewMs)} / ${time((current?.requiredSeconds || 0) * 1000)} provisional` : 'Completed unit · saved';
  }
  for (const fieldset of document.querySelectorAll('#questionArea fieldset, #quizArea fieldset')) fieldset.disabled = !usable();
  for (const button of document.querySelectorAll('#questionArea button[type="submit"], #quizArea button[type="submit"]')) button.disabled = !usable() || actionBusy();
  renderFeedback(p.feedback);
  nextCommand = null;
  el('nextArea').hidden = !active() || showQuiz;
  if (active() && !showQuiz) {
    if (current) {
      const enough = p.provisionalReviewMs >= current.requiredSeconds * 1000 && p.currentUnitActionComplete;
      el('nextAction').textContent = 'Complete unit review';
      el('nextHelp').textContent = enough ? 'The unit’s required review time and activity are recorded.' : `Read and work through the unit, then answer its question. ${p.currentUnitActionComplete ? 'Activity recorded.' : 'Activity still required.'} Time remains provisional until this unit is completed.`;
      if (enough) nextCommand = { kind: 'complete_unit' };
    } else {
      const module = p.modules.find((m) => !p.passedModuleIds.includes(m.id));
      const next = module?.units.find((u) => !p.completedUnitIds.includes(u.id));
      if (next) { el('nextAction').textContent = `Open: ${next.title}`; el('nextHelp').textContent = 'Continue with the next unit.'; nextCommand = { kind: 'open_unit', unitId: next.id }; }
      else if (module) { el('nextAction').textContent = 'Start module questions'; el('nextHelp').textContent = 'All unit reviews are saved. Complete the module questions next.'; nextCommand = { kind: 'quiz_start', moduleId: module.id }; }
    }
    el('nextAction').disabled = !nextCommand || !usable() || actionBusy();
  }
}

async function loadReviews() {
  const epoch = ++catalogEpoch;
  el('catalogStatus').textContent = 'Checking your review access…'; el('catalogRetry').hidden = true; el('catalogSignIn').hidden = true; el('reviewList').replaceChildren();
  try {
    const { status, body } = await postReview({ kind: 'list' });
    if (epoch !== catalogEpoch) return;
    if (status === 401) { el('catalogStatus').textContent = 'Sign in to see private reviews assigned to your account.'; signInLink(el('catalogSignIn')); el('catalogSignIn').hidden = false; return; }
    if (status !== 200 || !Array.isArray(body.reviews)) throw new Error('unavailable');
    el('catalogStatus').textContent = body.reviews.length ? 'Choose an assigned review to load your saved progress.' : 'No active private reviews are assigned to this account. Registering does not create a review assignment.';
    for (const review of body.reviews) {
      const card = document.createElement('article'); card.className = 'review-card';
      card.innerHTML = `<p class="eyebrow">Non-credit review</p><h2>${esc(review.title)}</h2><p>Access expires: ${esc(new Date(review.expiresAt).toLocaleString())}</p><button type="button" ${review.available ? '' : 'disabled'}>${review.available ? 'Open assigned review' : 'Assigned version unavailable'}</button>`;
      card.querySelector('button').addEventListener('click', () => { selectedUnit = null; locallyIdle = false; clearReading(); client.open(review); });
      el('reviewList').append(card);
    }
    const requested = new URLSearchParams(location.search).get('grant_id');
    const match = body.reviews.find((r) => r.grantId === requested && r.available);
    // Loading an explicitly linked grant is not resuming its study lease.
    if (match) client.open(match);
  } catch {
    if (epoch !== catalogEpoch) return;
    el('catalogStatus').textContent = 'Private review access is temporarily unavailable. Your other StateCourse courses are unaffected.';
    el('catalogRetry').hidden = false;
  }
}
document.addEventListener('submit', (event) => {
  if (!['unitForm', 'quizForm'].includes(event.target.id)) return;
  event.preventDefault(); if (!usable() || actionBusy()) return;
  const data = Object.fromEntries(new FormData(event.target));
  if (event.target.id === 'unitForm') client.send('unit_action', { choice: data.choice });
  else client.send('quiz_submit', { quizId: client.view.progress.quiz.id, answers: data });
});
el('outline').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-unit]'); if (!button || button.disabled) return;
  const p = client.view.progress; const id = button.dataset.unit;
  if (p.completedUnitIds.includes(id) || p.currentUnitId === id) {
    if (!['ready', 'busy'].includes(client.view.phase) || actionBusy()) return;
    selectedUnit = id; render(client.view);
    if (active() && p.currentUnitId) client.send('heartbeat', { visible: currentMaterialVisible() });
  }
  else if (usable()) client.send('open_unit', { unitId: id });
});
el('resumeReview').addEventListener('click', async () => {
  locallyIdle = false; clearReading();
  const result = await client.send('resume');
  if (!result?.cancelled && active()) resetIdle();
});
el('nextAction').addEventListener('click', () => {
  if (!nextCommand || !usable()) return;
  const { kind, ...fields } = nextCommand; selectedUnit = null; client.send(kind, fields);
});
el('exitReview').addEventListener('click', () => client.send('logout'));
el('retryCommand').addEventListener('click', () => client.retry());
el('reloadReview').addEventListener('click', () => { const grant = client.view.grant; clearReading(); locallyIdle = false; client.open(grant); });
el('catalogRetry').addEventListener('click', loadReviews);
el('backToReviews').addEventListener('click', () => {
  // Navigation never claims an unacknowledged logout succeeded. The next start
  // still needs explicit resumption and the server enforces inactivity/leases.
  client.stop(); clearReading(); clearTimeout(idleTimer); history.replaceState(null, '', '/student/nmls-review/'); loadReviews();
});
el('signOut').addEventListener('click', async () => {
  catalogEpoch++; client.stop(); clearReading(); clearTimeout(idleTimer); el('reviewList').replaceChildren();
  const response = await fetch('/api/student/session', { method: 'DELETE', credentials: 'same-origin', headers: { 'content-type': 'application/json' } }).catch(() => null);
  if (response?.ok) location.replace('/student/sign-in/');
  else { el('catalogStatus').textContent = 'Could not confirm account sign-out. This page is cleared. Retry signing out before leaving a shared device.'; el('catalogRetry').hidden = true; }
});
const observe = (kind, event) => {
  if (!event.isTrusted || !currentMaterialVisible() || !usable()) return;
  // No rendering, focus, timers or fetch callbacks create interaction evidence.
  resetIdle(); const now = performance.now();
  if (!client.view.progress.currentUnitId && !client.view.progress.quiz) return;
  // Buttons already submit explicit actions. A pointerdown poll must not disable
  // the button before its click, or steal the intended action's place in line.
  if (event.target.closest?.('button, a')) return;
  if (now - lastGesture < 10000 || client.view.phase !== 'ready') return;
  lastGesture = now;
  client.send('interaction', { observation: kind, visible: true }, { background: true });
};
document.addEventListener('pointerdown', (event) => observe('pointer', event), { passive: true });
document.addEventListener('keydown', (event) => observe('keyboard', event), { passive: true });
document.addEventListener('scroll', (event) => observe('scroll', event), { passive: true, capture: true });
const heartbeat = () => {
  if (active() && client.view.phase === 'ready' && (client.view.progress.currentUnitId || client.view.progress.quiz || locallyIdle)) {
    client.send('heartbeat', { visible: currentMaterialVisible() }, { background: true });
  }
};
setInterval(heartbeat, 15000);
document.addEventListener('visibilitychange', heartbeat);
loadReviews();
