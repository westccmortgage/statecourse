import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { PRACTICE_COLLECTIONS } from '../config/free-practice/collections.mjs';
import { PRACTICE_SOURCES, WITHHELD_PRACTICE_COURSES } from '../config/free-practice-sources.mjs';
import { loadTexasPracticeActivities } from './lib/free-practice-activities.mjs';
import { STATE_REFERENCES, PRACTICE_DISCLOSURE } from '../config/free-practice/references.mjs';
import { validatePracticePayload } from './lib/validate-free-practice.mjs';

const digest = text => createHash('sha256').update(text).digest('hex');

function collect(value, group, out = [], seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return out;
  seen.add(value);
  if (typeof value.prompt === 'string' && Array.isArray(value.choices)) {
    out.push({item:value,group});
    if (value.replacement) collect(value.replacement,group,out,seen);
  } else for (const child of Object.values(value)) collect(child,group,out,seen);
  return out;
}

export async function buildFreePractice({root,states,catalogCourses,write}) {
  const samples = [];
  // Remove only the generated artifacts from the inherited Washington practice.
  // Local rebuilds copy public/ into dist/, so merely removing the links is insufficient.
  for (const id of WITHHELD_PRACTICE_COURSES) {
    fs.rmSync(path.join(root, 'public/statecourse/free-practice/courses', id + '.json'), {force:true});
    fs.rmSync(path.join(root, 'public/statecourse/free-practice/lessons', id), {force:true, recursive:true});
  }
  for (const source of PRACTICE_SOURCES) {
    const course = catalogCourses.find(c => c.course_id === source.courseId);
    const state = states.find(s => s.state_code === source.stateCode);
    if (!course || !state) throw new Error(`Unregistered practice source: ${source.courseId}`);
    const dir = path.join(root,source.curriculumDir);
    const files = fs.readdirSync(dir).filter(f => /^(?:module|lesson)-\d+\.md$/.test(f)).sort();
    if (!files.length) throw new Error(`No student lessons: ${source.courseId}`);
    const bank = await import(pathToFileURL(path.join(root,source.bankPath)).href);
    const groups = source.bankExports ? bank.TOPIC_QUIZZES : bank.default?.sections
      ? Object.fromEntries(bank.default.sections.map((s,i) => [`module-${String(i+1).padStart(2,'0')}`,s.items]))
      : bank.default?.assignments ?? bank.default ?? bank.TOPIC_QUIZZES;
    const collected = [];
    for (const [group,value] of Object.entries(groups)) collect(value,group,collected);
    if (bank.REPLACEMENTS) for (const [group,value] of Object.entries(bank.REPLACEMENTS)) collect(value,group,collected);
    const lessons = files.map((file,index) => {
      const markdown = fs.readFileSync(path.join(root,source.lessonOverrides?.[file] ?? `${source.curriculumDir}/${file}`),'utf8');
      if (/instructor version and answer key|Items, with the material reference for each answer|__statecourse_private_export|^##\s*Answer key/im.test(markdown)) throw new Error(`Protected document in curriculum: ${file}`);
      const id = file.replace(/\.md$/,'');
      const content_url = `free-practice/lessons/${course.course_id}/${file}`;
      write(content_url,markdown);
      const title = markdown.match(/^#{1,2}\s+(.+)$/m)?.[1]?.replace(/\*\*/g,'') ?? `Lesson ${index+1}`;
      return {id,title,content_url,sha256:digest(markdown)};
    });
    const seenPrompts = new Set();
    const questions = collected.map(({item:original,group},index) => {
      const item = source.questionOverride?.(original) ?? original;
      if (!Number.isInteger(item.correctChoice) || !item.choices[item.correctChoice] || !item.rationale) throw new Error(`Invalid formative item ${source.courseId}/${index}`);
      const key = item.prompt.trim().toLowerCase();
      if (seenPrompts.has(key)) return null;
      seenPrompts.add(key);
      const groupNumber = String(group).match(/\d+/)?.[0];
      const lessonId = item.module ?? (groupNumber ? `${files[0].startsWith('lesson')?'lesson':'module'}-${groupNumber.padStart(2,'0')}` : lessons[0].id);
      if (!lessons.some(l => l.id === lessonId)) throw new Error(`Question has no lesson: ${source.courseId}/${lessonId}`);
      return {id:`${source.courseId}:${item.id ?? index+1}`,lesson_id:lessonId,prompt:item.prompt,choices:[...item.choices],solution:item.correctChoice,explanation:item.rationale,sources:item.sources?.length ? item.sources : STATE_REFERENCES[state.state_code] ?? [],state_code:state.state_code,category:item.category ?? lessons.find(l=>l.id===lessonId).title,curriculum_reference:source.lessonOverrides?.[lessonId+'.md'] ?? `${source.curriculumDir}/${lessonId}.md`};
    }).filter(Boolean);
    if (!questions.length) throw new Error(`No formative questions: ${source.courseId}`);
    const activities = source.scenarioPath ? await loadTexasPracticeActivities({root,courseId:source.courseId,lessonIds:lessons.map(l=>l.id)}) : [];
    const practice_url = `free-practice/courses/${course.course_id}.json`;
    const payload = validatePracticePayload({course_id:course.course_id,course_title:course.course_title,state_code:state.state_code,state_name:state.state_name,coverage:source.coverage,lessons,questions,activities,account_required:false,credit_eligible:false,certificate_available:false,disclosure:PRACTICE_DISCLOSURE});
    write(practice_url,JSON.stringify(payload,null,2)+'\n');
    samples.push({state_code:state.state_code,state_name:state.state_name,course_id:course.course_id,course_title:course.course_title,public_status:state.public_status,content_url:lessons[0].content_url,practice_url,lesson_count:lessons.length,question_count:questions.length,activity_count:activities.length,activity_task_count:activities.reduce((n,a)=>n+a.tasks.length,0),coverage:source.coverage,revision:digest(JSON.stringify(payload)).slice(0,16)});
  }
  for (const collection of PRACTICE_COLLECTIONS) {
    const state = states.find(entry => entry.state_code === collection.stateCode);
    const id = collection.id;
    if (!state || catalogCourses.some(course => course.course_id === id) || samples.some(sample => sample.course_id === id)) {
      throw new Error(`Invalid practice-only collection: ${id}`);
    }
    const questions = [];
    const prompts = new Set();
    const lessons = collection.topics.map(({slug, title, review, sources, items}) => {
      if (!items.length || !sources.length || !review.trim()) throw new Error(`Incomplete practice topic: ${id}/${slug}`);
      const markdown = `# ${title}\n\n${review}\n`;
      const content_url = `free-practice/lessons/${id}/${slug}.md`;
      write(content_url, markdown);
      for (const [index, item] of items.entries()) {
        const [prompt, answer, distractor1, distractor2, distractor3, explanation, reference] = item;
        const choices = [answer, distractor1, distractor2, distractor3];
        const key = prompt.trim().toLowerCase();
        if (!key || prompts.has(key) || !explanation.trim() || !choices.every(choice => choice.trim()) || new Set(choices).size !== 4) {
          throw new Error(`Invalid practice-only item: ${id}/${slug}/${index + 1}`);
        }
        prompts.add(key);
        questions.push({
          id: `${id}:${slug}:${index + 1}`, lesson_id: slug, category: title, prompt, choices,
          solution: 0, explanation, sources: reference ? [reference] : sources,
          state_code:state.state_code,curriculum_reference:`config/free-practice/${{FL:'florida',GA:'georgia',WA:'washington',NY:'new-york'}[state.state_code]}.mjs`,
        });
      }
      return {id:slug,title,content_url,sha256:digest(markdown)};
    });
    const practice_url = `free-practice/courses/${id}.json`;
    const payload = validatePracticePayload({course_id:id,course_title:collection.title,state_code:state.state_code,state_name:state.state_name,practice_only:true,lessons,questions,account_required:false,credit_eligible:false,certificate_available:false,disclosure:PRACTICE_DISCLOSURE});
    write(practice_url, JSON.stringify(payload, null, 2) + '\n');
    samples.push({
      state_code:state.state_code,state_name:state.state_name,course_id:id,course_title:collection.title,practice_only:true,
      content_url:lessons[0].content_url,practice_url,lesson_count:lessons.length,question_count:questions.length,
      activity_count:0,activity_task_count:0,revision:digest(JSON.stringify(payload)).slice(0,16),
    });
  }
  const practiceStates = states.flatMap(state => {
    const entries = samples.filter(sample => sample.state_code === state.state_code);
    if (!entries.length) return [];
    const slug = state.state_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return [{
      state_code:state.state_code, state_name:state.state_name, route:`free-practice/${slug}/`,
      question_count:entries.reduce((count, sample) => count + sample.question_count, 0),
      topics:PRACTICE_COLLECTIONS.find(collection => collection.stateCode === state.state_code)?.topics.map(topic => topic.title)
        ?? entries.map(sample => sample.course_title),
    }];
  });
  const manifest = {schema_version:'2.0',generated_from:['state-registry.json','course-catalog.json','explicit student curriculum and formative exercise allowlist','practice-only collections'],disclosure:'Free preview and formative practice only. No enrollment, regulated study time, licensing credit, certificate, or access to a course final examination is created.',states:practiceStates,samples};
  write('data/free-practice-catalog.json',JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
