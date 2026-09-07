import { escapeHtml as esc } from './student/course/blocks/lesson-markdown.mjs';
import { presentedChoices } from './practice-core.mjs';

// This module handles explicitly public formative casework only. It has no enrollment,
// clock, certificate, instructor-approval, or protected-examination integration.
export function checkPracticeTask(task, answer) {
  if (task.type === 'selection') {
    if (!Number.isInteger(answer) || answer < 0 || answer >= task.choices.length) return null;
    return { status: answer === task.solution ? 'correct' : 'review', explanation: task.explanation,
      expected: task.choices[task.solution] };
  }
  if (task.type === 'computation') {
    if (typeof answer !== 'number' || !Number.isFinite(answer)) return null;
    const roundoff = task.tolerance === 0 ? 0 : Number.EPSILON * Math.max(1, Math.abs(answer), Math.abs(task.solution)) * 4;
    return { status: Math.abs(answer - task.solution) <= task.tolerance + roundoff ? 'correct' : 'review',
      explanation: task.explanation, expected: String(task.solution) + (task.unit ? ' ' + task.unit : '') };
  }
  if (task.type === 'self-review') {
    if (typeof answer !== 'string' || !answer.trim()) return null;
    return { status: 'self-review', explanation: task.explanation, criteria: task.rubric.map(c => c.description) };
  }
  throw new Error('Unsupported public practice task');
}

const sourceLinks = sources => (sources ?? []).filter(s => /^https:\/\//.test(s.url)).map(s =>
  '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.reference || 'Official source') + '</a>').join(' · ');

export function renderPracticeActivities(container, activities, key) {
  const known = new Map(activities.flatMap(a => a.tasks.map(t => [t.id, t])));
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  const records = {};
  for (const [id, task] of known) {
    const record = saved[id];
    if (record && checkPracticeTask(task, record.answer)) records[id] = { answer: typeof record.answer === 'string' ? record.answer.slice(0, 10000) : record.answer, checked: record.checked === true };
  }
  function save() {
    // Merge only this lesson's known tasks; another lesson retains its own work.
    let all = {};
    try { all = JSON.parse(localStorage.getItem(key) || '{}'); } catch {}
    if (!all || typeof all !== 'object' || Array.isArray(all)) all = {};
    for (const id of known.keys()) delete all[id];
    try { localStorage.setItem(key, JSON.stringify({ ...all, ...records })); } catch {}
  }
  function draw() {
    container.innerHTML = '<h2 tabindex="-1">Casework and understanding checks</h2><p>Free, non-credit practice. Numerical and multiple-choice feedback is automatic. Written responses are self-review only: no instructor grade, course passage, regulated study time, or certificate is recorded. Work is saved only in this browser.</p>' +
      (!activities.length ? '<p>No separate casework is placed after this lesson. Its reading exercises and practice questions remain available.</p>' : activities.map(activity => {
        const results = activity.tasks.map(t => records[t.id]?.checked ? checkPracticeTask(t, records[t.id].answer) : null);
        const checked = results.every(Boolean), objective = results.filter(r => r && r.status !== 'self-review');
        return '<article class="practice-case" data-case="' + esc(activity.id) + '"><h3>' + esc(activity.title) + '</h3>' +
          '<div class="practice-case-context">' + esc(activity.context).replace(/\n/g, '<br>') + '</div>' +
          (activity.facts?.length ? '<ul class="practice-case-facts">' + activity.facts.map(f => '<li>' + esc(f) + '</li>').join('') + '</ul>' : '') +
          (sourceLinks(activity.sources) ? '<p class="practice-sources">Sources: ' + sourceLinks(activity.sources) + '</p>' : '') +
          '<form novalidate data-case-form="' + esc(activity.id) + '">' + activity.tasks.map((task, index) => {
            const record = records[task.id], result = results[index], field = 'case-' + task.id, feedback = field + '-feedback';
            const input = task.type === 'selection' ? presentedChoices({ ...task, solution: task.solution }).map(({ text, index: value }) =>
              '<label class="practice-answer"><input type="radio" name="' + esc(task.id) + '" value="' + value + '" ' + (record?.answer === value ? 'checked' : '') + ' required aria-describedby="' + esc(feedback) + '"><span>' + esc(text) + '</span></label>').join('') :
              task.type === 'computation' ? '<label for="' + esc(field) + '">Your answer' + (task.unit ? ' (' + esc(task.unit) + ')' : '') + '</label><input class="practice-number" id="' + esc(field) + '" name="' + esc(task.id) + '" type="number" step="any" required aria-describedby="' + esc(feedback) + '" value="' + esc(String(record?.answer ?? '')) + '">' :
              '<label for="' + esc(field) + '">Your written analysis (self-review, not an instructor grade)</label><textarea id="' + esc(field) + '" name="' + esc(task.id) + '" rows="5" maxlength="10000" required aria-describedby="' + esc(feedback) + '">' + esc(record?.answer ?? '') + '</textarea>';
            const explanation = !result ? '' : result.status === 'self-review' ? '<strong>Compare your response — no automatic grade.</strong><p>' + esc(result.explanation) + '</p><ul>' + result.criteria.map(c => '<li>' + esc(c) + '</li>').join('') + '</ul>' :
              '<strong>' + (result.status === 'correct' ? 'Correct.' : 'Review this result.') + '</strong><p>' + esc(result.explanation) + '</p>' + (result.status === 'review' ? '<p>Expected answer: ' + esc(result.expected) + '</p>' : '');
            return '<fieldset class="practice-case-task"><legend>' + (index + 1) + '. ' + esc(task.prompt) + '</legend>' + input +
              '<div id="' + esc(feedback) + '" class="practice-feedback ' + (result ? result.status === 'correct' ? 'is-correct' : result.status === 'review' ? 'is-incorrect' : '' : '') + '" role="status">' + explanation + '</div>' +
              (result && sourceLinks(task.sources) ? '<p class="practice-sources">Sources: ' + sourceLinks(task.sources) + '</p>' : '') + '</fieldset>';
          }).join('') + '<button type="submit" class="cta-button">Check practice and review reasoning</button> <button type="button" data-retry-case="' + esc(activity.id) + '">Start this activity again</button></form>' +
          '<p class="practice-case-summary" role="status" tabindex="-1">' + (checked ? objective.filter(r => r.status === 'correct').length + ' of ' + objective.length + ' objective checks correct. Written responses, if present, require your own review against the criteria. This is not course passage or an instructor assessment.' : 'Complete each response, then check your work.') + '</p>' +
          (activity.optional_reflection ? '<details><summary>Optional reflection — not graded</summary><p>' + esc(activity.optional_reflection.prompt) + '</p></details>' : '') + '</article>';
      }).join(''));
  }
  container.oninput = event => {
    const task = known.get(event.target.name); if (!task) return;
    const raw = event.target.value;
    const answer = task.type === 'selection' || task.type === 'computation' ? raw.trim() === '' ? null : Number(raw) : raw;
    if (checkPracticeTask(task, answer)) records[task.id] = { answer, checked: false };
    else delete records[task.id];
    const feedback = document.getElementById('case-' + task.id + '-feedback');
    feedback.replaceChildren(); feedback.classList.remove('is-correct', 'is-incorrect');
    for (const field of event.target.closest('fieldset').querySelectorAll('input,textarea')) field.removeAttribute('aria-invalid');
    const article = event.target.closest('[data-case]');
    article.querySelector('.practice-case-summary').textContent = 'Your response changed. Check this activity again to refresh the results.';
    save();
  };
  container.onsubmit = event => {
    const form = event.target.closest('[data-case-form]'); if (!form) return;
    event.preventDefault();
    const activity = activities.find(a => a.id === form.dataset.caseForm), data = new FormData(form);
    for (const task of activity.tasks) {
      const raw = data.get(task.id), answer = task.type === 'selection' || task.type === 'computation' ? raw === null || String(raw).trim() === '' ? null : Number(raw) : String(raw ?? '');
      if (!checkPracticeTask(task, answer)) {
        const field = form.elements.namedItem(task.id), first = field?.length ? field[0] : field;
        const feedback = document.getElementById('case-' + task.id + '-feedback');
        feedback.textContent = task.type === 'selection' ? 'Choose an answer.' : task.type === 'computation' ? 'Enter a finite number.' : 'Write your analysis before revealing the self-review criteria.';
        first?.setAttribute('aria-invalid', 'true'); first?.focus(); return;
      }
      records[task.id] = { answer, checked: true };
    }
    save(); draw();
    [...container.querySelectorAll('[data-case]')].find(el => el.dataset.case === activity.id)?.querySelector('.practice-case-summary')?.focus({ preventScroll: true });
  };
  container.onclick = event => {
    const button = event.target.closest('[data-retry-case]'); if (!button) return;
    const activity = activities.find(a => a.id === button.dataset.retryCase);
    for (const task of activity.tasks) delete records[task.id];
    save(); draw();
    [...container.querySelectorAll('[data-case]')].find(el => el.dataset.case === activity.id)?.querySelector('input,textarea')?.focus({ preventScroll: true });
  };
  draw();
}
