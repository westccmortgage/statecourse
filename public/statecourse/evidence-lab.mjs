import { escapeHtml as esc } from './student/course/blocks/lesson-markdown.mjs';
import { renderPracticeActivities } from './practice-activities.mjs';

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
};
const label = value => String(value).replaceAll('_', ' ');
function renderData(value) {
  if (value === null) return 'Not supplied';
  if (Array.isArray(value)) {
    if (!value.length) return 'None listed';
    if (value.every(item => item && typeof item === 'object' && !Array.isArray(item))) {
      const columns = [...new Set(value.flatMap(item => Object.keys(item)))];
      return '<div class="table-wrap"><table><thead><tr>' + columns.map(key => '<th scope="col">' + esc(label(key)) + '</th>').join('') +
        '</tr></thead><tbody>' + value.map(item => '<tr>' + columns.map(key => '<td>' + renderData(item[key] ?? null) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    }
    return '<ul>' + value.map(item => '<li>' + renderData(item) + '</li>').join('') + '</ul>';
  }
  if (typeof value === 'object') return '<dl class="evidence-fields">' + Object.entries(value).map(([key, child]) =>
    '<dt>' + esc(label(key)) + '</dt><dd>' + renderData(child) + '</dd>').join('') + '</dl>';
  return esc(String(value));
}
const bullets = values => '<ul>' + values.map(value => '<li>' + esc(value) + '</li>').join('') + '</ul>';

/** Entirely local, optional formative work. Stages are reading navigation, not
 * enrollment, elapsed-time, instructor/peer participation or completion gates.
 */
export function renderEvidenceLab(container, lab, key) {
  const rootKey = key + ':lab:' + lab.id + ':' + (lab.revision ?? lab.version);
  const saved = read(rootKey + ':position', {});
  let branch = lab.branches.some(item => item.id === saved?.branch) ? saved.branch : lab.branches[0].id;
  let stageIndex = Number.isInteger(saved?.stage) && saved.stage >= 0 && saved.stage < lab.stages.length ? saved.stage : 0;
  let savedHistory = read(rootKey + ':history', []);
  if (!Array.isArray(savedHistory)) savedHistory = [];
  const allTasks = new Map(Object.values(lab.activities_by_branch).flatMap(activities => activities.flatMap(activity => activity.tasks.map(task => [task.id, task]))));
  savedHistory = savedHistory.filter(entry => entry && ['R', 'U'].includes(entry.branch) && typeof entry.activity === 'string' &&
    typeof entry.date === 'string' && entry.answers && typeof entry.answers === 'object' && !Array.isArray(entry.answers))
    .map(entry => ({ ...entry, answers: Object.fromEntries(Object.entries(entry.answers).filter(([id, answer]) => allTasks.has(id) &&
      (typeof answer === 'string' || (typeof answer === 'number' && Number.isFinite(answer))))) }));
  let saveWarning = '';
  function save(suffix, value) {
    try { localStorage.setItem(rootKey + suffix, JSON.stringify(value)); }
    catch { saveWarning = 'This browser could not save this lab work. Keep your own copy before leaving.'; }
  }
  function historyHtml() {
    const entries = savedHistory.filter(entry => entry.branch === branch);
    return '<details class="evidence-history"><summary>Earlier submissions for path ' + esc(branch) + ' (' + entries.length + ')</summary>' +
      '<p>Submitted versions stay here when you revise a response. These are your own practice records, not instructor review or regulatory records.</p>' +
      (entries.length ? entries.map((entry, index) => '<details><summary>Submission ' + (index + 1) + ' · ' + esc(entry.stage) + ' · ' + esc(entry.date) + '</summary><dl>' +
        Object.entries(entry.answers).map(([id, answer]) => '<dt>' + esc(allTasks.get(id)?.prompt ?? id) + '</dt><dd>' + esc(String(answer)) + '</dd>').join('') + '</dl></details>').join('') : '<p>No submitted versions yet.</p>') + '</details>';
  }
  function draw() {
    const stage = lab.stages[stageIndex];
    const availableStages = new Set(lab.stages.slice(0, stageIndex + 1).map(item => item.id));
    const availableExhibits = lab.exhibits.filter(exhibit => availableStages.has(exhibit.stage) && exhibit.branches.includes(branch));
    const activities = lab.activities_by_branch[branch].filter(activity => activity.stage === stage.id);
    container.innerHTML = '<h2 tabindex="-1">' + esc(lab.title) + '</h2>' +
      '<p>Work through this fictional file in five releases. Choose one evidence path; its responses are saved separately. You may revisit any release. No account, payment, course time or credit is involved.</p>' +
      '<div class="evidence-navigation"><label>Evidence path<select data-lab-branch>' + lab.branches.map(item => '<option value="' + esc(item.id) + '" ' + (item.id === branch ? 'selected' : '') + '>Path ' + esc(item.id) + ': ' + esc(item.title) + '</option>').join('') +
      '</select></label><label>Release<select data-lab-stage>' + lab.stages.map((item, index) => '<option value="' + index + '" ' + (index === stageIndex ? 'selected' : '') + '>' + (index + 1) + '. ' + esc(item.title) + '</option>').join('') + '</select></label></div>' +
      '<p class="evidence-path-notice">' + esc(lab.branches.find(item => item.id === branch).condition) + ' Compare another path only as a separately labeled alternative.</p>' +
      '<details><summary>How to use this free lab</summary>' + bullets(lab.notices) + '<h3>Learning goals</h3>' + bullets(lab.learning_goals) + '<ol>' + lab.working_instructions.map(value => '<li>' + esc(value) + '</li>').join('') + '</ol>' +
      lab.reading_aids.map(item => '<h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p>').join('') + '</details>' +
      '<h3 class="evidence-release-title" tabindex="-1">Release ' + (stageIndex + 1) + ': ' + esc(stage.title) + '</h3><p>' + esc(stage.instruction) + '</p><p>Response version: <strong>' + esc(stage.response_version) + '</strong></p>' +
      '<div class="evidence-documents"><h3>Available source excerpts</h3><p>Only this path’s records received through the selected release appear here. An earlier record may still contain an unresolved condition.</p>' +
      availableExhibits.map(exhibit => {
        const fields = { ...exhibit.fields };
        if (fields.accepted_assets_by_branch) fields.accepted_assets_by_branch = { [branch]: fields.accepted_assets_by_branch[branch] };
        return '<details data-exhibit="' + esc(exhibit.id) + '" ' + (exhibit.stage === stage.id ? 'open' : '') + '><summary>' + esc(exhibit.id + ' ' + exhibit.title) + '</summary><p><strong>' + esc(exhibit.warning) + '</strong></p>' +
          '<p>Origin: ' + esc(exhibit.origin) + '. Created: ' + esc(exhibit.created_date) + '. Received: ' + esc(exhibit.received_date) + '.</p>' + renderData(fields) + bullets(exhibit.notes) + '</details>';
      }).join('') + '</div><div class="evidence-task-work"></div>' +
      '<details><summary>Source-map and change-log worksheet headings</summary><h3>Source-to-fact map</h3>' + renderData(lab.source_map_template) + '<h3>Changed-fact log</h3>' + renderData(lab.changed_fact_log_template) + '</details>' +
      (stageIndex >= 2 ? '<details><summary>Public self-review examples: compare only after trying your own record</summary><p>These worked examples compare both alternative paths. They do not make an unavailable record part of your chosen path.</p><h3>Source map</h3>' + renderData(lab.source_map_public_example) +
        (stageIndex >= 4 ? '<h3>Changed-fact log</h3>' + renderData(lab.changed_fact_log_public_example) : '') + '</details>' : '') +
      '<details><summary>Official sources and scope</summary><p>' + esc(lab.source_scope_note) + '</p>' + lab.sources.map(source => '<p><a href="' + esc(source.url) + '" target="_blank" rel="noopener noreferrer">' + esc(source.reference) + '</a></p><p>' + esc(source.concept) + '</p><p>' + esc(source.scope) + ' Checked ' + esc(source.verified_date) + '.</p>').join('') + '</details>' +
      '<div class="evidence-history-host">' + historyHtml() + '</div><p class="evidence-save-status" role="status">' + esc(saveWarning) + '</p>' +
      '<nav class="evidence-navigation" aria-label="Evidence lab releases"><button type="button" data-lab-previous ' + (stageIndex === 0 ? 'disabled' : '') + '>← Previous release</button><button type="button" data-lab-next ' + (stageIndex === lab.stages.length - 1 ? 'disabled' : '') + '>Next release →</button></nav>';
    renderPracticeActivities(container.querySelector('.evidence-task-work'), activities, rootKey + ':' + branch + ':answers', {
      onSaveError() {
        saveWarning = 'This browser could not save this lab work. Keep your own copy before leaving.';
        container.querySelector('.evidence-save-status').textContent = saveWarning;
      },
      onCommit(activity, records) {
        const answers = Object.fromEntries(Object.entries(records).map(([id, record]) => [id, record.answer]));
        const last = savedHistory.at(-1);
        if (!last || last.activity !== activity.id || JSON.stringify(last.answers) !== JSON.stringify(answers)) {
          savedHistory.push({ branch, stage: stage.response_version, activity: activity.id, date: new Date().toISOString(), answers });
          save(':history', savedHistory);
        }
        container.querySelector('.evidence-history-host').innerHTML = historyHtml();
        container.querySelector('.evidence-save-status').textContent = saveWarning;
      },
    });
  }
  function navigate() {
    save(':position', { branch, stage: stageIndex });
    draw();
    container.querySelector('.evidence-release-title').focus({ preventScroll: true });
    container.querySelector('.evidence-release-title').scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  container.onchange = event => {
    if (event.target.matches('[data-lab-branch]')) { branch = event.target.value; navigate(); }
    if (event.target.matches('[data-lab-stage]')) { stageIndex = Number(event.target.value); navigate(); }
  };
  container.onclick = event => {
    if (event.target.closest('[data-lab-previous]') && stageIndex > 0) { stageIndex--; navigate(); }
    if (event.target.closest('[data-lab-next]') && stageIndex < lab.stages.length - 1) { stageIndex++; navigate(); }
  };
  draw();
}
