import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { PE_FOUNDATIONS, TOPIC_QUIZZES, SCENARIOS } from '../../config/pe-foundations-practice.mjs';
import { projectPracticeActivities } from './free-practice-activities.mjs';

// Explicitly public, newly authored formative material. Never load the CE
// review loader, final banks, instructor guide, or an aggregate NMLS source tree.
const lessonFiles = ['module-01.md', 'module-02.md'];
const digest = text => createHash('sha256').update(text).digest('hex');
const protectedText = /N26-FIN-|##\s*Answer key|instructor version and answer key|Items, with the material reference for each answer|__statecourse_private_export/i;
const requireText = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Missing PE practice ${label}`);
  return value;
};
const publicSources = values => {
  if (!Array.isArray(values) || !values.length) throw new Error('PE practice source required');
  return values.map(source => {
    const url = new URL(requireText(source.url, 'source URL'));
    if (url.protocol !== 'https:') throw new Error('PE practice sources must use HTTPS');
    return { url: url.href, reference: requireText(source.reference, 'source reference') };
  });
};

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
    if (!Array.isArray(items) || items.length < 6) throw new Error(`Incomplete PE formative practice: ${lesson.id}`);
    return items.map(item => {
      if (item.module !== lesson.id || !Array.isArray(item.choices) || item.choices.length !== 4 ||
          new Set(item.choices).size !== 4 || item.choices.some(choice => typeof choice !== 'string' || !choice.trim()) ||
          !Number.isInteger(item.correctChoice) || item.correctChoice < 0 || item.correctChoice > 3)
        throw new Error('Invalid PE formative item');
      return { id: `${source.courseId}:${requireText(item.id, 'question ID')}`, lesson_id: lesson.id,
        prompt: requireText(item.prompt, 'prompt'), choices: [...item.choices], solution: item.correctChoice,
        explanation: requireText(item.rationale, 'explanation'), sources: publicSources(item.sources) };
    });
  });
  if (new Set(questions.map(q => q.id)).size !== questions.length || new Set(questions.map(q => q.prompt)).size !== questions.length)
    throw new Error('Duplicate PE formative item');
  const activities = projectPracticeActivities({ courseId: source.courseId, lessonIds: lessons.map(l => l.id), scenarios });
  if (!activities.length || lessons.some(lesson => !activities.some(a => a.lesson_id === lesson.id)))
    throw new Error('Missing PE lesson casework');
  const payload = {
    course_id: source.courseId, course_title: source.courseTitle, state_code: source.stateCode, state_name: source.stateName,
    coverage: source.coverage, operating_mode: 'free_practice', creditEligible: false, completeCourse: false,
    availability_notice: 'Two foundation modules are available; the full 20-hour course is still in development.',
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
