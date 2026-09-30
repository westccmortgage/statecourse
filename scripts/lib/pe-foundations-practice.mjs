import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PE_FOUNDATIONS, TOPIC_QUIZZES, SCENARIOS } from '../../config/pe-foundations-practice.mjs';
import { PUBLIC_ITEM_COUNTS, isReviewedSourcelessCase } from '../../config/pe-application-practice.mjs';
import { projectPracticeActivities } from './free-practice-activities.mjs';

// Explicitly public, newly authored formative material. Never load the CE
// review loader, final banks, instructor guide, or an aggregate NMLS source tree.
const lessonFiles = ['module-01.md', 'module-02.md', 'module-03.md', 'module-04.md', 'module-05.md', 'module-06.md', 'module-07.md', 'module-08.md'];
const digest = text => createHash('sha256').update(text).digest('hex');
const protectedText = /N26-FIN-|##\s*Answer key|instructor version and answer key|Items, with the material reference for each answer|__statecourse_private_export/i;
const requireText = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing PE practice ${label}`);
  return value;
};
const publicSources = values => {
  if (!Array.isArray(values) || !values.length) throw new Error('PE practice source required');
  return Array.from(values, source => {
    if (!source || typeof source !== 'object') throw new Error('Invalid PE practice source');
    const url = new URL(requireText(source.url, 'source URL'));
    if (url.protocol !== 'https:') throw new Error('PE practice sources must use HTTPS');
    return { url: url.href, reference: requireText(source.reference, 'source reference') };
  });
};

const denseArray = (values, label, minimum = 0) => {
  if (!Array.isArray(values) || values.length < minimum) throw new Error(`Invalid PE ${label}`);
  for (let index = 0; index < values.length; index++)
    if (!Object.hasOwn(values, index)) throw new Error(`Sparse PE ${label}`);
  return values;
};

// The shared projection deliberately permits legacy real-estate sources without
// citations. Public PE inputs have a stricter boundary without changing that API.
function validatePeScenarios(scenarios) {
  for (const scenario of denseArray(scenarios, 'scenario inventory', 1)) {
    if (!scenario || typeof scenario !== 'object') throw new Error('Invalid PE scenario');
    publicSources(denseArray(scenario.sources, 'scenario sources', 1));
    if (scenario.facts !== undefined) denseArray(scenario.facts, 'scenario facts');
    for (const task of denseArray(scenario.tasks, 'scenario tasks', 1)) {
      if (!task || typeof task !== 'object') throw new Error('Invalid PE scenario task');
      if (task.sources !== undefined) publicSources(denseArray(task.sources, 'task sources', 1));
      if (task.type === 'selection') denseArray(task.choices, 'task choices', 4);
      if (task.type === 'short-answer' || task.type === 'self-review') denseArray(task.rubric, 'task rubric', 1);
    }
  }
}

export function buildPeFoundationsPractice({ root, write, quizzes = TOPIC_QUIZZES, scenarios = SCENARIOS }) {
  const source = PE_FOUNDATIONS;
  const lessons = lessonFiles.map(file => {
    const markdown = fs.readFileSync(path.join(root, source.curriculumDir, file), 'utf8');
    if (protectedText.test(markdown)) throw new Error(`Protected PE practice input: ${file}`);
    const introduction = markdown.split(/^##\s/m)[0];
    if (!/no (?:NMLS |licensing )?credit/i.test(introduction) || !/not NMLS approved/i.test(introduction))
      throw new Error(`Missing PE non-credit disclosure: ${file}`);
    const content_url = `free-practice/lessons/${source.courseId}/${file}`;
    const title = markdown.match(/^#\s+(.+)$/m)?.[1];
    requireText(title, 'lesson title');
    return { id: file.replace(/\.md$/, ''), title, content_url, sha256: digest(markdown), markdown };
  });
  if (Object.keys(quizzes).length !== lessons.length || Object.keys(quizzes).some(id => !lessons.some(l => l.id === id)))
    throw new Error('Invalid PE practice lesson mapping');
  const questions = lessons.flatMap(lesson => {
    const items = quizzes[lesson.id];
    const bankId = lesson.id.replace('module-', 'PE');
    const reviewedBank = Object.hasOwn(PUBLIC_ITEM_COUNTS, bankId);
    if (!Array.isArray(items) || items.length < 6) throw new Error(`Incomplete PE formative practice: ${lesson.id}`);
    if (reviewedBank && items.length !== PUBLIC_ITEM_COUNTS[bankId]) throw new Error(`Incomplete reviewed PE bank: ${bankId}`);
    return Array.from(items, item => {
      if (!item || typeof item !== 'object' || item.module !== lesson.id || !Array.isArray(item.choices) || item.choices.length !== 4 ||
          new Set(item.choices).size !== 4 || Array.from(item.choices).some(choice => typeof choice !== 'string' || !choice.trim()) ||
          !Number.isInteger(item.correctChoice) || item.correctChoice < 0 || item.correctChoice > 3)
        throw new Error('Invalid PE formative item');
      if (reviewedBank && (typeof item.id !== 'string' || !item.id.startsWith(`${bankId}-P`) || item.choiceFeedback === undefined))
        throw new Error('Missing reviewed PE identity or per-choice feedback');
      if (item.choiceFeedback !== undefined && (!Array.isArray(item.choiceFeedback) ||
          item.choiceFeedback.length !== 4 || Array.from(item.choiceFeedback).some(value => typeof value !== 'string' || !value.trim())))
        throw new Error('Incomplete PE per-choice feedback');
      const sources = Array.isArray(item.sources) && !item.sources.length && item.sourceNote && isReviewedSourcelessCase(bankId, item.id)
        ? [] : publicSources(item.sources);
      return { id: `${source.courseId}:${requireText(item.id, 'question ID')}`, lesson_id: lesson.id,
        prompt: requireText(item.prompt, 'prompt'), choices: [...item.choices], solution: item.correctChoice,
        explanation: requireText(item.rationale, 'explanation'), sources,
        ...(item.choiceFeedback ? { choice_feedback: [...item.choiceFeedback] } : {}),
        ...(sources.length ? {} : { source_note: requireText(item.sourceNote, 'fictional-case source note') }) };
    });
  });
  if (new Set(questions.map(q => q.id)).size !== questions.length || new Set(questions.map(q => q.prompt)).size !== questions.length)
    throw new Error('Duplicate PE formative item');
  validatePeScenarios(scenarios);
  const activities = projectPracticeActivities({ courseId: source.courseId, lessonIds: lessons.map(l => l.id), scenarios });
  if (!activities.length || lessons.some(lesson => !activities.some(a => a.lesson_id === lesson.id)))
    throw new Error('Missing PE lesson casework');
  const payload = {
    course_id: source.courseId, course_title: source.courseTitle, state_code: source.stateCode, state_name: source.stateName,
    coverage: source.coverage, operating_mode: 'free_practice', creditEligible: false, completeCourse: false,
    availability_notice: 'Eight draft modules are available; the qualifying 20-hour course is still in development.',
    providerApproval: null, courseApproval: null, access: 'Free before, during and after paid enrollment. No account or payment required.',
    lessons: lessons.map(({ id, title, content_url, sha256 }) => ({ id, title, content_url, sha256 })), questions, activities,
  };
  const encoded = JSON.stringify(payload, null, 2) + '\n';
  if (protectedText.test(encoded)) throw new Error('Protected PE practice output');
  // Validate every input before making any output writes.
  for (const lesson of lessons) write(lesson.content_url, lesson.markdown);
  const practice_url = `free-practice/courses/${source.courseId}.json`;
  write(practice_url, encoded);
  return {
    state_code: source.stateCode, state_name: source.stateName, course_id: source.courseId, course_title: source.courseTitle,
    public_status: 'In Development', record_url: source.recordUrl, content_url: lessons[0].content_url, practice_url,
    lesson_count: lessons.length, question_count: questions.length, activity_count: activities.length,
    activity_task_count: activities.reduce((count, a) => count + a.tasks.length, 0), coverage: source.coverage,
    creditEligible: false, completeCourse: false, revision: digest(encoded).slice(0, 16),
  };
}
