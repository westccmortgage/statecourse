// Explicit, reviewed PUBLIC student material only. No server content loader or
// protected course/assessment tree participates in this supplemental practice.
import SOURCE from './pe-public-practice/PE03-evidence-lab.json' with { type: 'json' };
import { projectPracticeActivities } from '../scripts/lib/free-practice-activities.mjs';

const fail = () => { throw new Error('Invalid public PE evidence lab'); };
const text = value => typeof value === 'string' && value.trim() ? value : fail();
const array = (value, count) => {
  if (!Array.isArray(value) || (count !== undefined && value.length !== count)) fail();
  for (let i = 0; i < value.length; i++) if (!Object.hasOwn(value, i)) fail();
  return value;
};
const texts = value => array(value).map(text);
const clone = value => JSON.parse(JSON.stringify(value));
const exactIds = (values, ids) => {
  if (values.length !== ids.length || new Set(values.map(value => value.id)).size !== ids.length ||
      values.some((value, index) => !value || value.id !== ids[index])) fail();
};
const safeData = value => {
  if (value === null || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return value;
  if (typeof value === 'string') return text(value);
  if (Array.isArray(value)) return array(value).map(safeData);
  if (!value || typeof value !== 'object') fail();
  return Object.fromEntries(Object.entries(value).map(([key, child]) => {
    if (['__proto__', 'prototype', 'constructor'].includes(key)) fail();
    return [text(key), safeData(child)];
  }));
};
const branchesFor = value => {
  const result = texts(value);
  if (!result.length || new Set(result).size !== result.length || result.some(branch => !['R', 'U'].includes(branch))) fail();
  return result;
};

export function buildPeEvidenceLab({ bundle = SOURCE, courseId = 'national-safe-pe-foundations' } = {}) {
  if (bundle?.id !== 'pe03-evidence-lab' || bundle.module !== 'PE03' || bundle.schema_version !== '1.0.0' ||
      bundle.metadata?.public_formative !== true || bundle.metadata.self_guided !== true ||
      bundle.metadata.credit_bearing !== false || bundle.metadata.official_final_exam !== false ||
      bundle.metadata.duration_validated !== false || bundle.metadata.oil_delivery_implemented !== false) fail();
  const branchIds = ['R', 'U'];
  const stages = array(bundle.stages, 5);
  const exhibits = array(bundle.exhibits, 10);
  const tasks = array(bundle.tasks, 16);
  for (const [key, count] of Object.entries({ stages: 5, mutually_exclusive_branches: 2, fictional_excerpts: 10, formative_tasks: 16, numeric_expectations: 36, primary_sources: 4 }))
    if (bundle.counts?.[key] !== count) fail();
  exactIds(stages, Array.from({ length: 5 }, (_, i) => `release-${i + 1}`));
  exactIds(exhibits, Array.from({ length: 10 }, (_, i) => `E${String(i + 1).padStart(2, '0')}`));
  exactIds(tasks, Array.from({ length: 16 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`));
  exactIds(array(bundle.branches, 2), branchIds);
  const stageIndex = new Map(stages.map((stage, index) => [stage.id, index]));
  const exhibitMap = new Map(exhibits.map(exhibit => [exhibit.id, exhibit]));
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  const seenExhibits = [], seenTasks = [];
  for (const stage of stages) {
    text(stage.title); text(stage.response_version); text(stage.instruction);
    for (const id of texts(stage.exhibit_ids)) {
      if (exhibitMap.get(id)?.stage !== stage.id) fail();
      seenExhibits.push(id);
    }
    for (const id of texts(stage.task_ids)) {
      if (taskMap.get(id)?.stage !== stage.id) fail();
      seenTasks.push(id);
    }
  }
  if (new Set(seenExhibits).size !== 10 || seenExhibits.length !== 10 || new Set(seenTasks).size !== 16 || seenTasks.length !== 16) fail();
  const publicExhibits = exhibits.map(exhibit => {
    if (exhibit.fictional !== true || !stageIndex.has(exhibit.stage) || !exhibit.fields || Array.isArray(exhibit.fields)) fail();
    const branches = branchesFor(exhibit.applicable_branches);
    if (exhibit.id === 'E06' && branches.join(',') !== 'R') fail();
    return { id: exhibit.id, title: text(exhibit.title), stage: exhibit.stage, branches,
      warning: text(exhibit.warning), origin: text(exhibit.origin), created_date: text(exhibit.created_date),
      received_date: text(exhibit.received_date), fields: safeData(exhibit.fields), notes: texts(exhibit.notes) };
  });
  const sources = array(bundle.sources, 4).map(source => {
    const url = new URL(text(source.url));
    if (url.protocol !== 'https:') fail();
    return { id: text(source.id), url: url.href, reference: `${text(source.authority)} ${text(source.section)}: ${text(source.title)}`,
      scope: text(source.scope), concept: text(source.concept), verified_date: text(source.verified_date) };
  });
  if (new Set(sources.map(source => source.id)).size !== 4) fail();
  const numericKeys = new Set();
  const resolveField = (fieldPath, task, branches) => {
    const parts = text(fieldPath).match(/[^.\[\]]+/g);
    const exhibit = exhibitMap.get(parts[0]);
    if (!exhibit || stageIndex.get(exhibit.stage) > stageIndex.get(task.stage) ||
        branches.some(branch => !exhibit.applicable_branches.includes(branch))) fail();
    let value = exhibit;
    for (const part of parts.slice(1)) {
      if (!value || !Object.hasOwn(value, part)) fail();
      value = value[part];
    }
    return value;
  };
  for (const task of tasks) {
    if (!stageIndex.has(task.stage) || task.public_self_review?.intentionally_public !== true) fail();
    text(task.title); text(task.prompt); text(task.public_self_review.explanation);
    if (!texts(task.public_self_review.rubric).length) fail();
    for (const id of texts(task.source_exhibit_ids))
      if (!exhibitMap.has(id) || stageIndex.get(exhibitMap.get(id).stage) > stageIndex.get(task.stage)) fail();
    if (task.source_exhibit_ids_by_branch) for (const branch of branchIds)
      for (const id of texts(task.source_exhibit_ids_by_branch[branch]))
        if (!task.source_exhibit_ids.includes(id) || !exhibitMap.get(id)?.applicable_branches.includes(branch)) fail();
    for (const expectation of array(task.public_self_review.numeric_expectations)) {
      const key = text(expectation.key);
      if (numericKeys.has(key) || typeof expectation.expected !== 'string' ||
          !/^-?\d+\.\d{2}$/.test(expectation.expected) || !Number.isFinite(Number(expectation.expected))) fail();
      numericKeys.add(key); text(expectation.derivation); text(expectation.unit);
      const branches = branchesFor(expectation.applicable_branches);
      if (!texts(expectation.source_field_paths).length) fail();
      for (const field of expectation.source_field_paths) resolveField(field, task, branches);
    }
  }
  if (numericKeys.size !== 36) fail();
  const activitiesByBranch = Object.fromEntries(branchIds.map(branch => {
    const scenarios = tasks.map(task => {
      const sourceIds = texts(task.source_exhibit_ids_by_branch?.[branch] ?? task.source_exhibit_ids)
        .filter(id => exhibitMap.get(id)?.applicable_branches.includes(branch));
      if (!sourceIds.length) fail();
      const expectations = task.public_self_review.numeric_expectations.filter(item => item.applicable_branches.includes(branch));
      return { id: `PEEL-${branch}-${task.id}`, module: 'module-03', title: `${task.id} ${task.title}`,
        context: `Path ${branch}. ${task.prompt}`, facts: [`Use only these available exhibits: ${sourceIds.join(', ')}. Other-path comparisons in public feedback do not change this path's evidence.`],
        sources, tasks: [
          ...expectations.map(item => ({ id: `PEEL-${branch}-${task.id}-${item.key}`, type: 'computation',
            prompt: item.key.replace(/^[RU]_/, '').replaceAll('_', ' '), expected: Number(item.expected), tolerance: 0.005, unit: item.unit,
            rationale: `${item.derivation}. Source fields: ${item.source_field_paths.join('; ')}. ${task.public_self_review.explanation}` })),
          { id: `PEEL-${branch}-${task.id}-reasoning`, type: 'short-answer', prompt: task.prompt,
            rationale: task.public_self_review.explanation, rubric: [...task.public_self_review.rubric] },
        ] };
    });
    const activities = projectPracticeActivities({ courseId, lessonIds: ['module-03'], scenarios });
    return [branch, activities.map((activity, i) => ({ ...activity, lab_task_id: tasks[i].id, stage: tasks[i].stage, branch }))];
  }));
  const counts = { R: 49, U: 45 };
  for (const branch of branchIds)
    if (activitiesByBranch[branch].reduce((sum, item) => sum + item.tasks.length, 0) !== counts[branch]) fail();
  return {
    id: bundle.id, title: text(bundle.title), version: text(bundle.version), lesson_id: 'module-03',
    notices: texts(bundle.access_and_scope), learning_goals: texts(bundle.learning_goals),
    working_instructions: texts(bundle.working_instructions), reading_aids: array(bundle.reading_aids).map(item => ({ title: text(item.title), text: text(item.text) })),
    source_scope_note: text(bundle.source_scope_note), sources,
    branches: bundle.branches.map(branch => ({ id: branch.id, title: text(branch.title), condition: text(branch.condition) })),
    stages: stages.map(stage => ({ id: stage.id, title: stage.title, response_version: stage.response_version,
      instruction: stage.instruction, exhibit_ids: [...stage.exhibit_ids], task_ids: [...stage.task_ids] })),
    exhibits: publicExhibits, activities_by_branch: activitiesByBranch,
    source_map_template: safeData(bundle.source_map_template), source_map_public_example: safeData(bundle.source_map_public_example),
    changed_fact_log_template: safeData(bundle.changed_fact_log_template), changed_fact_log_public_example: safeData(bundle.changed_fact_log_public_example),
    public_formative: true, creditEligible: false, durationValidated: false, oilDeliveryImplemented: false,
  };
}

// The source is never mutated; this export is convenient for focused validation.
export const publicPeEvidenceLabSource = () => clone(SOURCE);
