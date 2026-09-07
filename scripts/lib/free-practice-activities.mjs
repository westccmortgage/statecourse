/** Node-side formative projection. No file writes, browser code, or protected inputs.
 * Caller must load only the explicit SCENARIOS / MISCONCEPTION_CHECKS exports from
 * the formative paths explicitly listed below.
 * This projection is not a replacement for source-path and no-final-content tests.
 */
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const TEXAS_FULL_PRACTICE_SOURCES = Object.freeze([
  ['law-of-contracts', 11, 6, 30, 6],
  ['promulgated-contract-forms', 9, 4, 24, 0],
  ['real-estate-finance', 10, 4, 20, 0],
].map(([slug, lessonCount, scenarioCount, scenarioTaskCount, misconceptionCount]) => Object.freeze({
  stateCode: 'TX', courseId: `tx-${slug}-30`,
  curriculumDir: `texas/tx-${slug}-30-v1/curriculum`,
  bankPath: `config/texas/${slug}-question-bank.mjs`,
  bankExports: Object.freeze(['TOPIC_QUIZZES', 'REPLACEMENTS']),
  scenarioPath: `config/texas/${slug}-scenarios.mjs`,
  misconceptionPath: slug === 'law-of-contracts' ? 'config/texas/law-of-contracts-misconception-checks.mjs' : null,
  coverage: 'full authored non-credit curriculum',
  lessonCount, scenarioCount, scenarioTaskCount, misconceptionCount,
})));

/** The caller supplies only repository root, catalog course ID, and known lesson IDs.
 * It cannot substitute an arbitrary module or a protected/course aggregate path.
 * Do not call for legacy practice sources: they have their existing separate path.
 */
export async function loadTexasPracticeActivities({root, courseId, lessonIds}) {
  const source = TEXAS_FULL_PRACTICE_SOURCES.find(value => value.courseId === courseId);
  if (!source) throw Error(`Unknown full Texas practice course: ${courseId}`);
  if (!Array.isArray(lessonIds) || lessonIds.length !== source.lessonCount) throw Error(`Incomplete lesson inventory: ${courseId}`);
  const load = relative => import(pathToFileURL(path.join(root, relative)).href);
  const scenarioModule = await load(source.scenarioPath);
  const scenarios = scenarioModule.SCENARIOS;
  const misconceptions = source.misconceptionPath ? (await load(source.misconceptionPath)).MISCONCEPTION_CHECKS : [];
  if (!Array.isArray(scenarios) || scenarios.length !== source.scenarioCount || scenarios.reduce((count, value) => count + (value.tasks?.length ?? 0), 0) !== source.scenarioTaskCount) throw Error(`Incomplete scenario inventory: ${courseId}`);
  if (!Array.isArray(misconceptions) || misconceptions.length !== source.misconceptionCount) throw Error(`Incomplete misconception inventory: ${courseId}`);
  return projectPracticeActivities({courseId, lessonIds, scenarios, misconceptions});
}
const text = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw Error(`Missing ${label}`);
  return value;
};
const sources = value => (Array.isArray(value) ? value : []).map(source => {
  const url = new URL(text(source.url, 'source URL'));
  if (url.protocol !== 'https:') throw Error('Only HTTPS source links are allowed');
  return {url: url.href, reference: text(source.reference, 'source reference')};
});
const unique = (values, label) => {
  if (new Set(values).size !== values.length) throw Error(`Duplicate ${label}`);
};

export function projectPracticeActivities({courseId, lessonIds, scenarios = [], misconceptions = []}) {
  text(courseId, 'course ID');
  if (!Array.isArray(lessonIds) || !lessonIds.length) throw Error('Lessons required');
  if (!Array.isArray(scenarios) || !Array.isArray(misconceptions)) throw Error('Explicit formative arrays required');
  unique(lessonIds, 'lesson ID');
  const place = (module, topic, capstone = false) => {
    const fromTopic = /^T\d{2}$/.test(topic ?? '') ? `module-${topic.slice(1)}` : null;
    if (topic != null && !fromTopic) throw Error(`Invalid activity topic: ${topic}`);
    if (module && fromTopic && module !== fromTopic) throw Error('Conflicting activity placement');
    const id = module ?? fromTopic;
    if (!lessonIds.includes(id)) throw Error(`Activity has no valid lesson: ${id}`);
    if (capstone && id !== lessonIds.at(-1)) throw Error('Course capstone must map to the final lesson');
    return id;
  };
  const task = (value, activityId, inheritedSources = []) => {
    const kind = value.type === 'short-answer' ? 'self-review' : value.type;
    if (!['selection', 'computation', 'self-review'].includes(kind)) throw Error(`Unsupported formative task type: ${kind}`);
    const output = {
      id: `${courseId}:${text(value.id, 'task ID')}`, activity_id: activityId, type: kind,
      prompt: text(value.prompt, 'task prompt'),
      explanation: text(value.rationale ?? value.feedbackCorrect ?? value.feedbackIncorrect, 'task feedback'),
      sources: sources(value.sources?.length ? value.sources : inheritedSources),
    };
    if (kind === 'selection') {
      if (!Array.isArray(value.choices) || value.choices.length !== 4) throw Error('Four choices required');
      output.choices = value.choices.map(choice => text(choice, 'choice'));
      unique(output.choices, 'choice');
      if (!Number.isInteger(value.correctChoice) || value.correctChoice < 0 || value.correctChoice > 3) throw Error('Invalid formative selection key');
      output.solution = value.correctChoice;
    } else if (kind === 'computation') {
      const solution = value.expected ?? value.answer ?? value.correctValue;
      if (!Number.isFinite(solution) || !Number.isFinite(value.tolerance) || value.tolerance < 0) throw Error('Numeric solution and tolerance required');
      output.solution = solution;
      output.tolerance = value.tolerance;
      if (value.unit ?? value.unitLabel) output.unit = text(value.unit ?? value.unitLabel, 'numeric unit');
    } else {
      if (!Array.isArray(value.rubric) || !value.rubric.length) throw Error('Self-review criteria required');
      output.rubric = value.rubric.map((criterion, index) => ({
        id: typeof criterion === 'string' ? `criterion-${index + 1}` : text(criterion.id ?? `criterion-${index + 1}`, 'criterion ID'),
        description: text(typeof criterion === 'string' ? criterion : criterion.description, 'criterion description'),
        emphasized: typeof criterion === 'object' && criterion.required === true,
      }));
      output.review_notice = 'Compare your written work with these criteria and the feedback. Self-review is not an instructor grade, approval, or licensing credit.';
    }
    return output;
  };
  const activities = scenarios.map(value => {
    const id = `${courseId}:${text(value.id, 'scenario ID')}`;
    const capstone = value.courseLevel === true || value.placement?.timeAttribution === 'COURSE_LEVEL';
    const context = text(value.context ?? value.narrative ?? value.prompt, 'scenario context');
    if (!Array.isArray(value.tasks) || !value.tasks.length) throw Error('Scenario tasks required');
    const output = {
      id, kind: 'scenario', lesson_id: place(value.module, value.afterTopic ?? value.placement?.afterTopic, capstone),
      title: text(value.title, 'scenario title'), context,
      facts: [...new Set((value.facts ?? []).filter(fact => fact !== context).map(fact => text(fact, 'scenario fact')))],
      sources: sources(value.sources), capstone, mode: 'SELF_GUIDED_NON_CREDIT',
      tasks: value.tasks.map(valueTask => task(valueTask, id, value.sources)),
    };
    // The sources on LOC cases are case-level. PCF places sources on each task.
    // REF currently supplies neither: retain the lesson link; do not invent a citation.
    const reflection = value.optionalReflection ?? value.reflection;
    if (reflection?.prompt) output.optional_reflection = {prompt: text(reflection.prompt, 'reflection prompt'), graded: false, required: false};
    return output;
  });
  for (const value of misconceptions) {
    const id = `${courseId}:${text(value.id, 'misconception ID')}`;
    activities.push({id, kind: 'misconception', lesson_id: place(value.module, value.topicCode),
      title: 'Misconception check', context: '', facts: [], sources: sources(value.sources),
      mode: 'SELF_GUIDED_NON_CREDIT',
      tasks: [task({...value, type: 'selection'}, id)],
    });
  }
  unique(activities.map(value => value.id), 'activity ID');
  unique(activities.flatMap(value => value.tasks.map(task => task.id)), 'task ID');
  return activities;
}

/** Browser-portable numeric parsing recommendation. Blank strings, booleans,
 * currency-formatted strings, NaN and Infinity must not silently become answers.
 * UI can document a plain decimal format or implement separately tested formatting.
 */
export function parsePracticeNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
