import { TrainingClient } from './training-client.mjs';
import { escapeHtml as esc, renderLessonMarkdown } from '../nmls-review/lesson-markdown.mjs';
import { presentOptions } from '../nmls-review/question-presentation.mjs';

const lessonMedia=(lesson,enrollmentId)=>(lesson?.videos||[]).map(v=>`<course-video provider="cloudflare-stream" asset-key="${esc(v.assetKey)}" enrollment-id="${esc(enrollmentId)}" label="${esc(v.label)}"></course-video>`).join('');

const messages = {
  connection_interrupted: 'Connection interrupted. The last action is not confirmed. Your answers remain on this page. Use Retry safely before continuing.',
  nmls_training_revision_conflict: 'Progress changed on another device. Reload saved progress, then explicitly continue here.',
  nmls_training_session_conflict: 'This device no longer owns the study session. Reload saved progress to continue here.',
  nmls_review_session_conflict: 'This device no longer owns the study session. Reload saved progress to continue here.',
  nmls_review_revision_conflict: 'Progress changed on another device. Reload saved progress to continue here.',
  nmls_training_phase_conflict: 'The training stage changed. Reload saved progress.',
  nmls_training_idempotency_conflict: 'The action could not be reconciled safely. Reload saved progress.',
  nmls_training_access_denied: 'This training enrollment is unavailable or inactive. Contact StateCourse if you need access restored.',
  nmls_training_content_changed: 'This training version needs staff review. Your saved progress has not been replaced.',
  course_logout_required: 'The study session ended. Resume explicitly. Saved units remain; unfinished work may need to restart.',
  invalid_answer_set: 'Answer every question before submitting.',
  unit_requirements_unmet: 'Work through the unit and answer its activity. The displayed practice time must also be reached.',
  review_answer_incorrect: 'Your answer was recorded. Read the explanation below, then try again.',
  enrollment_required: 'Open this training from My StateCourse using your own enrollment.',
};
const teachingPhases = ['not_started', 'source', 'remediation'];
const time = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
const questionHtml = (q, name, index = '') => `<fieldset><legend>${index ? `${index}. ` : ''}${esc(q.stem)}</legend>${presentOptions(q.options).map(o =>
  `<label class="answer"><input type="radio" name="${esc(name)}" value="${esc(o.id)}" required><span>${esc(o.displayLabel)}. ${esc(o.text)}</span></label>`).join('')}</fieldset>`;

export function mountTrainingWorkspace({ document: doc = globalThis.document, window: win = globalThis.window,
  transport, newId, setTimer = globalThis.setTimeout, clearTimer = globalThis.clearTimeout,
  setPoll = globalThis.setInterval, clearPoll = globalThis.clearInterval } = {}) {
  const el = id => doc.getElementById(id), listeners = [];
  const on = (target, kind, fn, options) => { target.addEventListener(kind, fn, options); listeners.push(() => target.removeEventListener(kind, fn, options)); };
  let selected = null, contentKey = '', outlineKey = '', feedbackKey = '', paused = true, pauseEpoch = 0, idleTimer, poll = null, lastGesture = 0, next = null, phaseAction = null;
  const client = new TrainingClient({ transport, newId, onChange: render, onRenderError: () => {
    clearTimer(idleTimer); clearPrivate(); el('syncStatus').textContent = 'The learning interface could not be displayed safely. Reload to retrieve saved progress.';
  } });
  const snapshot = () => client.view.snapshot;
  const progress = () => snapshot()?.progress;
  const teaching = () => teachingPhases.includes(snapshot()?.phase);
  const active = () => teaching() && progress()?.status === 'active' && Boolean(progress().sessionId);
  const ready = () => ['ready', 'busy'].includes(client.view.phase) && !paused && !doc.hidden && win.navigator.onLine !== false;
  const canAct = () => ready() && !client.view.foregroundPending;
  const allUnits = p => p.modules.flatMap(m => m.units.map(u => ({ ...u, moduleId: m.id })));
  const visible = () => ready() && active() && Boolean(progress()?.quiz || progress()?.currentUnitId && selected === progress().currentUnitId);
  function resetIdle() {
    clearTimer(idleTimer);
    if (active() && !paused) idleTimer = setTimer(() => pause('idle'), 360000);
  }
  function clearPrivate() {
    contentKey = ''; outlineKey = ''; feedbackKey = ''; selected = null;
    for (const id of ['lesson', 'questionArea', 'quizArea', 'assessmentArea', 'feedbackArea', 'outline']) el(id).replaceChildren();
    for (const id of ['unitMeta', 'questionArea', 'quizArea', 'assessmentArea', 'feedbackArea', 'nextArea', 'phasePanel', 'readOnlyPanel', 'resumePanel']) el(id).hidden = true;
  }
  function syncPolling(enabled) {
    if (!enabled && poll !== null) { clearPoll(poll); poll = null; }
    if (enabled && poll === null) poll = setPoll(() => {
      if (active() && !paused && client.view.phase === 'ready') client.teach('heartbeat', { visible: visible() }, { background: true });
    }, 15000);
  }
  function renderReadOnly(s) {
    paused = true; clearTimer(idleTimer); next = null; phaseAction = null;
    el('workspace').hidden = false; el('pauseTraining').hidden = true;
    for (const id of ['resumePanel', 'phasePanel', 'unitMeta', 'quizArea', 'assessmentArea', 'feedbackArea', 'nextArea', 'formError', 'savedSummary', 'timingNotice']) el(id).hidden = true;
    for (const id of ['quizArea', 'assessmentArea', 'feedbackArea']) el(id).replaceChildren();
    el('readOnlyPanel').hidden = false;
    el('readOnlyNotice').textContent = s.review.notice;
    const rules = s.review.assessmentRules;
    el('readOnlyRules').textContent = `Training assessment rules: ${rules.questionCount} questions per attempt from a ${rules.bankCount}-question bank; ${rules.requiredCorrect} correct required. Maximum ${rules.maxAutomaticAttempts} automatic attempts, with mandatory targeted remediation after an unsuccessful first attempt.`;
    const modules = s.review.modules, lessons = modules.flatMap(m => m.lessons);
    if (!selected || !lessons.some(l => l.id === selected) && !modules.some(m => `questions:${m.id}` === selected)) selected = lessons[0].id;
    const navKey = `read-only:${s.enrollmentId}:${s.revision}:${selected}`;
    if (outlineKey !== navKey) {
      outlineKey = navKey;
      el('outline').innerHTML = modules.map(m => `<h2>${esc(m.title)}</h2><ol>${m.lessons.map(l => `<li><button type="button" data-review-unit="${esc(l.id)}" ${selected === l.id ? 'aria-current="page"' : ''}>${esc(l.title)}</button></li>`).join('')}<li><button type="button" data-review-unit="${esc(`questions:${m.id}`)}" ${selected === `questions:${m.id}` ? 'aria-current="page"' : ''}>View module questions</button></li></ol>`).join('');
    }
    const key = `read-only:${s.enrollmentId}:${s.revision}:${selected}`;
    if (contentKey !== key) {
      contentKey = key;
      const lesson = lessons.find(l => l.id === selected), module = modules.find(m => `questions:${m.id}` === selected);
      el('lesson').innerHTML = lesson ? renderLessonMarkdown(lesson.content)+lessonMedia(lesson,s.enrollmentId) : `<h2>${esc(module.title)} — module questions</h2>`;
      const questions = lesson ? [lesson.question] : module.formativeQuestions;
      el('questionArea').hidden = false;
      el('questionArea').innerHTML = `<h2>${lesson ? 'Unit activity' : 'Module questions'} · read-only</h2>${questions.map((q, i) => `<section><h3>${i + 1}. ${esc(q.stem)}</h3><ol type="A">${q.options.map(o => `<li>${esc(o.text)}</li>`).join('')}</ol></section>`).join('')}`;
    }
  }
  function pause(reason = 'manual') {
    paused = true; pauseEpoch++; clearTimer(idleTimer); render(client.view);
    // Hidden/idle observations do not fabricate interaction or elapsed time.
    // A pending write is reconciled before any further observation can be sent.
    if (active() && ['ready', 'busy'].includes(client.view.phase) && win.navigator.onLine !== false) {
      if (reason === 'idle') client.teach('heartbeat', { visible: false }, { background: true });
      else client.teach('logout', {}, { background: true });
    }
    return reason;
  }
  function renderFeedback(feedback) {
    const key = JSON.stringify(feedback);
    if (key === feedbackKey) return;
    feedbackKey = key; const area = el('feedbackArea'); area.hidden = !feedback;
    if (!feedback) { area.replaceChildren(); return; }
    const sources = item => (item.sourceUrls || []).filter(url => /^https:\/\//.test(url)).map((url, i) =>
      `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Source ${i + 1}</a>`).join(' · ');
    if (feedback.kind === 'module_quiz') area.innerHTML = `<h2>${feedback.passed ? 'Module practice passed' : 'Review and try again'}: ${feedback.correct} of ${feedback.total} correct</h2><ol>${feedback.items.map(item => `<li><strong>${item.correct ? 'Correct' : 'Needs review'}.</strong> ${esc(item.rationale)}<p>${sources(item)}</p></li>`).join('')}</ol>`;
    else area.innerHTML = `<h2>${feedback.correct ? 'Correct — activity saved' : 'Review the explanation and try again'}</h2><p>${esc(feedback.rationale)}</p><p>${sources(feedback)}</p>`;
  }
  function render(view) {
    const s = view.snapshot, p = s?.progress;
    syncPolling(Boolean(p) && teachingPhases.includes(s.phase) && !['auth', 'denied', 'recover'].includes(view.phase));
    if (['uncertain', 'recover', 'auth', 'denied'].includes(view.phase)) { paused = true; clearTimer(idleTimer); }
    if (p && teachingPhases.includes(s.phase) && p.status !== 'review_complete' && !p.sessionId) paused = true;
    let status = paused ? 'Saved progress loaded. Choose “Start or resume training” to continue on this device.' : 'Progress saved. Practice time is provisional until the unit is completed.';
    if (view.phase === 'loading') status = 'Loading your saved training…';
    if (view.phase === 'busy') status = 'Saving training activity…';
    if (view.error) status = messages[view.error] || 'The last action could not be completed. Reload saved progress or contact StateCourse if this continues.';
    if (view.phase === 'auth') status = 'Your account session ended. Sign in again. Private lesson content has been cleared.';
    if (win.navigator.onLine === false) status = 'You are offline. Practice is paused. Reconnect, reconcile any pending action, then resume explicitly.';
    if (view.code === 'course_logged_out') status = 'Training paused. Saved units remain available.';
    if (s?.phase === 'passed') status = 'Training completed and saved. No NMLS credit or certificate has been issued.';
    if (s?.phase === 'staff_review_required') status = 'Your practice results are saved. Staff review is required before any further attempt.';
    if (s?.readOnly === true) status = 'Read-only regulator review. Browsing does not change training progress or award credit.';
    el('syncStatus').textContent = status;
    el('syncStatus').parentElement.dataset.error = String(Boolean(view.error));
    el('retryCommand').hidden = view.phase !== 'uncertain';
    el('reloadTraining').hidden = !['recover', 'denied', 'uncertain', 'render_error'].includes(view.phase);
    el('studySignIn').hidden = view.phase !== 'auth';
    el('studySignIn').href = `/student/sign-in/?return_to=${encodeURIComponent(`/student/nmls-training/${win.location.search}`)}`;
    el('missingEnrollment').hidden = view.error !== 'enrollment_required';
    el('workspace').hidden = !p;
    el('pauseTraining').hidden = !s || paused || ['passed', 'staff_review_required'].includes(s.phase);
    el('pauseTraining').disabled = view.phase !== 'ready';
    if (s?.readOnly === true && !['auth', 'denied', 'recover'].includes(view.phase)) {
      el('courseTitle').textContent = s.course.title; renderReadOnly(s); return;
    }
    if (!p || ['auth', 'denied', 'recover'].includes(view.phase)) { clearPrivate(); return; }
    el('readOnlyPanel').hidden = true; el('savedSummary').hidden = false; el('timingNotice').hidden = false;
    el('courseTitle').textContent = s.course.title;
    const terminal = ['passed', 'staff_review_required'].includes(s.phase);
    el('resumePanel').hidden = !paused || terminal;
    el('resumeTraining').disabled = view.phase !== 'ready' || doc.hidden || win.navigator.onLine === false;
    el('resumeTraining').textContent = s.assessment ? 'Continue practice assessment' : 'Start or resume training';
    el('resumeHelp').textContent = s.assessment ? 'The same saved question set will continue. Answers already submitted cannot be changed. Unsubmitted choices are kept only on this page.'
      : 'Saved units remain available. Resume explicitly to use this device; another active study session is replaced. Unfinished work may need to restart.';
    const units = allUnits(p), current = units.find(u => u.id === p.currentUnitId);
    const firstIncomplete = units.find(u => !p.completedUnitIds.includes(u.id));
    if (!selected || !p.completedUnitIds.includes(selected) && selected !== p.currentUnitId) selected = p.currentUnitId;
    el('savedSummary').textContent = `${p.completedUnitIds.length} of ${units.length} units saved · ${p.passedModuleIds.length} of ${p.modules.length} module practices passed${s.phase === 'remediation' ? ' · targeted review' : ''}`;
    const navKey = JSON.stringify([p.completedUnitIds, p.passedModuleIds, p.currentUnitId, selected, s.phase, paused, ['ready', 'busy'].includes(view.phase), view.foregroundPending]);
    if (outlineKey !== navKey) {
      outlineKey = navKey;
      el('outline').innerHTML = p.modules.map(m => `<h2>${esc(m.title)}</h2><ol>${m.units.map(u => {
        const done = p.completedUnitIds.includes(u.id), opened = p.currentUnitId === u.id;
        const allowed = canAct() && active() && !p.quiz && (done || opened || firstIncomplete?.id === u.id);
        return `<li><button type="button" data-unit="${esc(u.id)}" ${selected === u.id ? 'aria-current="step"' : ''} ${allowed ? '' : 'disabled'}>${esc(u.title)}<small>${done ? 'Saved' : opened ? 'In progress' : 'Not completed'} · ${Math.ceil(u.requiredSeconds / 60)} min practice</small></button></li>`;
      }).join('')}</ol><p class="fine-print">Module practice: ${p.passedModuleIds.includes(m.id) ? 'Passed' : 'After all units'}</p>`).join('');
    }
    const lesson = p.lessons.find(item => item.id === selected);
    const showQuiz = teaching() && Boolean(p.quiz), showFinal = Boolean(s.assessment);
    const key = `${s.enrollmentId}:${s.phase}:${showFinal ? `assessment:${s.assessment.id}` : showQuiz ? `quiz:${p.quiz.id}` : `unit:${lesson?.id || ''}:${p.sessionId || ''}`}`;
    // Heartbeats never recreate forms, randomize options, lose drafts or focus.
    if (contentKey !== key) {
      const previous = contentKey; contentKey = key;
      el('formError').hidden = true;
      el('lesson').innerHTML = !showQuiz && !showFinal && lesson ? renderLessonMarkdown(lesson.content)+lessonMedia(lesson,s.enrollmentId) : '';
      el('questionArea').hidden = showQuiz || showFinal || !lesson || lesson.id !== p.currentUnitId;
      el('questionArea').innerHTML = !el('questionArea').hidden ? `<h2>Apply what you read</h2><form id="unitForm">${questionHtml(lesson.question, 'choice')}<button type="submit">Check my answer</button></form>` : '';
      el('quizArea').hidden = !showQuiz;
      el('quizArea').innerHTML = showQuiz ? `<h2>Module practice</h2><p>Answer all ${p.quiz.questions.length} questions. An 80% practice score is required to continue. This is not a licensing examination.</p><form id="quizForm">${p.quiz.questions.map((q, i) => questionHtml(q, q.id, i + 1)).join('')}<button type="submit">Submit module practice</button></form>` : '';
      el('assessmentArea').hidden = !showFinal;
      el('assessmentArea').innerHTML = showFinal ? `<h2>Practice assessment ${s.assessment.number} of 2</h2><p>Answer all 25 questions; 18 correct are required. Submission is final. This assessment does not award NMLS credit or certification.</p><p>Unsubmitted choices are kept on this page only. If you reload or switch devices, the same questions return but you must select your unsubmitted answers again.</p><form id="assessmentForm">${s.assessment.questions.map((q, i) => questionHtml(q, q.id, i + 1)).join('')}<button type="submit">Submit practice assessment</button></form>` : '';
      if (previous && !paused) {
        const heading = (showFinal ? el('assessmentArea') : showQuiz ? el('quizArea') : el('lesson')).querySelector('h2, h3');
        if (heading) { heading.tabIndex = -1; heading.focus?.(); }
      }
    }
    el('unitMeta').hidden = !lesson || showQuiz || showFinal;
    if (lesson) {
      el('unitPosition').textContent = `Unit ${units.findIndex(u => u.id === lesson.id) + 1} of ${units.length}`;
      el('unitTime').textContent = lesson.id === p.currentUnitId ? `${time(p.provisionalPracticeMs)} / ${time((current?.requiredSeconds || 0) * 1000)} practice · provisional` : 'Completed unit · saved';
    }
    for (const fieldset of doc.querySelectorAll('.question-area fieldset')) fieldset.disabled = !ready() || view.foregroundPending;
    for (const button of doc.querySelectorAll('.question-area button[type="submit"]')) button.disabled = !canAct();
    renderFeedback(p.feedback);
    next = null; el('nextArea').hidden = !teaching() || !active() || showQuiz;
    if (!el('nextArea').hidden) {
      if (current) {
        const enough = p.provisionalPracticeMs >= current.requiredSeconds * 1000 && p.currentUnitActionComplete;
        el('nextAction').textContent = 'Complete unit practice';
        el('nextHelp').textContent = enough ? 'The activity and provisional practice time are recorded. Save this unit to continue.' : `Work through the lesson and its question. ${p.currentUnitActionComplete ? 'Activity saved.' : 'Activity still required.'} Practice time remains provisional until completion.`;
        if (enough) next = { kind: 'complete_unit' };
      } else {
        const module = p.modules.find(m => !p.passedModuleIds.includes(m.id));
        const unit = module?.units.find(u => !p.completedUnitIds.includes(u.id));
        if (unit) { next = { kind: 'open_unit', unitId: unit.id }; el('nextAction').textContent = `Open: ${unit.title}`; el('nextHelp').textContent = 'Continue with the next unit.'; }
        else if (module) { next = { kind: 'quiz_start', moduleId: module.id }; el('nextAction').textContent = 'Start module questions'; el('nextHelp').textContent = 'All unit activities in this module are saved.'; }
      }
      el('nextAction').disabled = !next || !canAct();
    }
    phaseAction = null;
    const completeSource = teaching() && p.status === 'review_complete';
    el('phasePanel').hidden = !completeSource && !['remediation_required', 'passed', 'staff_review_required'].includes(s.phase);
    el('phaseAction').hidden = true; el('finishedLink').hidden = !terminal;
    el('assessmentResult').textContent = s.result ? `Practice result: ${s.result.correct} of ${s.result.total} correct. Passing threshold: ${s.result.requiredCorrect}.` : '';
    if (completeSource) {
      el('phaseTitle').textContent = s.phase === 'remediation' ? 'Targeted review finished' : 'Lessons and module practices finished';
      el('phaseHelp').textContent = 'Your work is saved. Continue to the practice assessment. This remains non-credit training.';
      phaseAction = 'issue_assessment'; el('phaseAction').textContent = s.phase === 'remediation' ? 'Start second practice assessment' : 'Start practice assessment';
    } else if (s.phase === 'remediation_required') {
      el('phaseTitle').textContent = 'Targeted review is required';
      el('phaseHelp').textContent = 'Review the lessons linked to your missed topics and complete their activities before a second assessment. Its 25 questions will not repeat the first set.';
      phaseAction = 'start_remediation'; el('phaseAction').textContent = 'Start targeted review';
    } else if (s.phase === 'passed') {
      el('phaseTitle').textContent = 'Training completed';
      el('phaseHelp').textContent = 'Your lessons, module practices and passing practice result are saved. This is not completion of an approved CE course; no NMLS credit, certificate or reporting has been issued.';
    } else if (s.phase === 'staff_review_required') {
      el('phaseTitle').textContent = 'Staff review is needed';
      el('phaseHelp').textContent = 'Two practice assessments have been submitted. A third attempt is not available. Contact StateCourse through My StateCourse for help; your work remains saved. No NMLS credit or certificate was issued.';
    }
    el('phaseAction').hidden = !phaseAction; el('phaseAction').disabled = !canAct();
  }
  async function resume() {
    if (snapshot()?.readOnly === true || client.view.phase !== 'ready' || doc.hidden || win.navigator.onLine === false) return;
    const beganAtPauseEpoch = pauseEpoch;
    if (teaching() && progress()?.status !== 'review_complete') {
      const result = await client.teach('resume');
      if (result?.status !== 200 || !active()) return;
    }
    if (beganAtPauseEpoch !== pauseEpoch || doc.hidden || win.navigator.onLine === false) { paused = true; render(client.view); return; }
    paused = false; render(client.view); resetIdle();
  }
  const showFormError = message => { el('formError').hidden = false; el('formError').textContent = message; el('formError').focus?.(); };
  on(doc, 'submit', event => {
    if (!['unitForm', 'quizForm', 'assessmentForm'].includes(event.target.id)) return;
    event.preventDefault(); if (!canAct()) return;
    const entries = [...event.target.querySelectorAll('input[type="radio"]')].filter(input => input.checked).map(input => [input.name, input.value]);
    const answers = Object.fromEntries(entries), expected = event.target.querySelectorAll('fieldset').length;
    if (Object.keys(answers).length !== expected) { showFormError('Answer each question before submitting. Your selected choices are unchanged.'); return; }
    el('formError').hidden = true;
    if (event.target.id === 'unitForm') client.teach('unit_action', { choice: answers.choice });
    else if (event.target.id === 'quizForm') client.teach('quiz_submit', { quizId: progress().quiz.id, answers });
    else client.send('submit_assessment', { assessmentId: snapshot().assessment.id, answers });
  });
  on(el('outline'), 'click', event => {
    if (snapshot()?.readOnly === true) {
      const button = event.target.closest('button[data-review-unit]');
      if (button && !button.disabled) { selected = button.dataset.reviewUnit; render(client.view); const heading = el('lesson').querySelector('h2, h3'); if (heading) { heading.tabIndex = -1; heading.focus?.(); } }
      return;
    }
    const button = event.target.closest('button[data-unit]'); if (!button || button.disabled || !canAct()) return;
    const id = button.dataset.unit, p = progress();
    if (p.completedUnitIds.includes(id) || p.currentUnitId === id) { selected = id; render(client.view); client.teach('heartbeat', { visible: visible() }, { background: true }); }
    else client.teach('open_unit', { unitId: id });
  });
  on(el('resumeTraining'), 'click', resume);
  on(el('pauseTraining'), 'click', () => pause());
  on(el('nextAction'), 'click', () => { if (next && canAct()) { const { kind, ...fields } = next; selected = null; client.teach(kind, fields); } });
  on(el('phaseAction'), 'click', () => { if (phaseAction && canAct()) client.send(phaseAction); });
  on(el('retryCommand'), 'click', () => client.retry());
  on(el('reloadTraining'), 'click', () => { paused = true; clearTimer(idleTimer); clearPrivate(); client.open(client.view.enrollmentId); });
  on(el('signOut'), 'click', async () => {
    paused = true; clearTimer(idleTimer); client.stop(); clearPrivate();
    const response = await win.fetch('/api/student/session', { method: 'DELETE', credentials: 'same-origin', headers: { 'content-type': 'application/json' } }).catch(() => null);
    if (response?.ok) win.location.replace('/student/sign-in/');
    else el('syncStatus').textContent = 'Account sign-out could not be confirmed. Content is cleared. Retry Sign out before leaving a shared device.';
  });
  const observe = (kind, event) => {
    if (!event.isTrusted || !visible() || !active()) return;
    resetIdle();
    if (event.target.closest?.('button, a')) return;
    const now = win.performance.now();
    if (now - lastGesture < 10000 || client.view.phase !== 'ready') return;
    lastGesture = now; client.teach('interaction', { observation: kind, visible: true }, { background: true });
  };
  on(doc, 'pointerdown', event => observe('pointer', event), { passive: true });
  on(doc, 'keydown', event => observe('keyboard', event), { passive: true });
  on(doc, 'scroll', event => observe('scroll', event), { passive: true, capture: true });
  on(doc, 'visibilitychange', () => { if (doc.hidden) pause('hidden'); else render(client.view); });
  on(win, 'offline', () => pause('offline'));
  on(win, 'online', () => render(client.view));
  on(win, 'pagehide', () => pause('pagehide'));
  client.open(new URLSearchParams(win.location.search).get('enrollment_id'));
  return { client, render: () => render(client.view), pause, resume,
    destroy() { clearTimer(idleTimer); clearPoll(poll); listeners.forEach(remove => remove()); client.stop(); clearPrivate(); } };
}
if (typeof document !== 'undefined' && typeof window !== 'undefined') mountTrainingWorkspace();
