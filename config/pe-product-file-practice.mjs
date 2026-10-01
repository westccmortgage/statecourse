// These six explicit files contain newly authored PUBLIC formative content.
// No private CE manuscript, instructor guide or protected assessment is imported.
import PE07 from './pe-public-practice/PE07.json' with { type: 'json' };
import PE08 from './pe-public-practice/PE08.json' with { type: 'json' };
import PE07_SOURCES from './pe-public-practice/PE07-sources.json' with { type: 'json' };
import PE08_SOURCES from './pe-public-practice/PE08-sources.json' with { type: 'json' };
import PE07_ACTIVITIES from './pe-public-practice/PE07-activities.json' with { type: 'json' };
import PE08_ACTIVITIES from './pe-public-practice/PE08-activities.json' with { type: 'json' };
import { normalizePublicPeBank } from './pe-application-practice.mjs';

const PUBLIC_CASE_COUNTS = Object.freeze({ PE07: 4, PE08: 4 });
const PUBLIC_TASK_COUNTS = Object.freeze({ PE07: 21, PE08: 31 });
const PUBLIC_NUMERIC_COUNTS = Object.freeze({ PE07: 14, PE08: 18 });
const requireText = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing public PE ${label}`);
  return value;
};

export function normalizePublicPeActivities(bundle, moduleId, sourceRegistry) {
  if (!Object.hasOwn(PUBLIC_CASE_COUNTS, moduleId) || !bundle ||
      bundle.schema_version !== '1.0' || bundle.module_id !== moduleId ||
      bundle.public_formative !== true || bundle.credit_bearing !== false ||
      (bundle.official_final_exam !== undefined && bundle.official_final_exam !== false) ||
      (bundle.repeatable_practice !== undefined && bundle.repeatable_practice !== true) ||
      bundle.duration_validated !== false || bundle.delivery_mode !== 'public_self_guided_noncredit' ||
      !Array.isArray(bundle.scenarios) || bundle.scenarios.length !== PUBLIC_CASE_COUNTS[moduleId])
    throw new Error('Invalid public PE activity boundary');
  // Preserve complete public tasks for the existing validated projection. No
  // authoring metadata, proposed duration or delivery authority enters the UI.
  const scenarios = Array.from(bundle.scenarios, scenario => {
    if (!scenario || scenario.module !== `module-${moduleId.slice(2)}` || !Array.isArray(scenario.tasks))
      throw new Error('Invalid public PE activity module');
    const { numerical_checks: numericChecks = [], ...publicScenario } = scenario;
    if (!Array.isArray(numericChecks)) throw new Error('Invalid public PE numeric inventory');
    const numericTasks = Array.from(numericChecks, check => {
      if (!check || check.type !== 'numeric' || !Array.isArray(check.source_ids) || !check.source_ids.length)
        throw new Error('Invalid public PE numeric check');
      const sources = Array.from(check.source_ids, id => {
        const source = sourceRegistry?.[requireText(id, 'numeric source ID')];
        if (!source || new URL(source.url).protocol !== 'https:' || !source.reference)
          throw new Error('Unresolved public PE numeric source');
        return { url: source.url, reference: source.reference };
      });
      return { id: requireText(check.id, 'numeric ID'), type: 'computation',
        prompt: requireText(check.label, 'numeric prompt'), expected: check.expected,
        tolerance: check.tolerance, unit: requireText(check.unit, 'numeric unit'),
        rationale: `${requireText(check.derivation, 'numeric derivation')} ${requireText(check.feedback, 'numeric feedback')}`,
        sources };
    });
    return { ...publicScenario, tasks: [...scenario.tasks, ...numericTasks] };
  });
  const tasks = scenarios.flatMap(scenario => scenario.tasks);
  if (tasks.length !== PUBLIC_TASK_COUNTS[moduleId] ||
      tasks.filter(task => task?.type === 'computation').length !== PUBLIC_NUMERIC_COUNTS[moduleId])
    throw new Error('Incomplete public PE case tasks');
  return scenarios;
}

export const PRODUCT_FILE_TOPIC_QUIZZES = {
  'module-07': normalizePublicPeBank(PE07, 'PE07', PE07_SOURCES.PE07),
  'module-08': normalizePublicPeBank(PE08, 'PE08', PE08_SOURCES.PE08),
};

export const PE_PRODUCT_FILE_SCENARIOS = [
  ...normalizePublicPeActivities(PE07_ACTIVITIES, 'PE07', PE07_SOURCES.PE07),
  ...normalizePublicPeActivities(PE08_ACTIVITIES, 'PE08', PE08_SOURCES.PE08),
];
