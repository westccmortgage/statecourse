import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { PRACTICE_SOURCES } from '../config/free-practice-sources.mjs';

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
  for (const source of PRACTICE_SOURCES) {
    const course = catalogCourses.find(c => c.course_id === source.courseId);
    const state = states.find(s => s.state_code === source.stateCode);
    if (!course || !state) throw new Error(`Unregistered practice source: ${source.courseId}`);
    const dir = path.join(root,source.curriculumDir);
    const files = fs.readdirSync(dir).filter(f => /^(?:module|lesson)-\d+\.md$/.test(f)).sort();
    if (!files.length) throw new Error(`No student lessons: ${source.courseId}`);
    const bank = await import(pathToFileURL(path.join(root,source.bankPath)).href);
    const groups = bank.default?.sections
      ? Object.fromEntries(bank.default.sections.map((s,i) => [`module-${String(i+1).padStart(2,'0')}`,s.items]))
      : bank.default?.assignments ?? bank.default ?? bank.TOPIC_QUIZZES;
    const collected = [];
    for (const [group,value] of Object.entries(groups)) collect(value,group,collected);
    if (bank.REPLACEMENTS) for (const [group,value] of Object.entries(bank.REPLACEMENTS)) collect(value,group,collected);
    const lessons = files.map((file,index) => {
      const markdown = fs.readFileSync(path.join(dir,file),'utf8');
      if (/instructor version and answer key|Items, with the material reference for each answer|__statecourse_private_export|^##\s*Answer key/im.test(markdown)) throw new Error(`Protected document in curriculum: ${file}`);
      const id = file.replace(/\.md$/,'');
      const content_url = `free-practice/lessons/${course.course_id}/${file}`;
      write(content_url,markdown);
      const title = markdown.match(/^#{1,2}\s+(.+)$/m)?.[1]?.replace(/\*\*/g,'') ?? `Lesson ${index+1}`;
      return {id,title,content_url,sha256:digest(markdown)};
    });
    const seenPrompts = new Set();
    const questions = collected.map(({item,group},index) => {
      if (!Number.isInteger(item.correctChoice) || !item.choices[item.correctChoice] || !item.rationale) throw new Error(`Invalid formative item ${source.courseId}/${index}`);
      const key = item.prompt.trim().toLowerCase();
      if (seenPrompts.has(key)) return null;
      seenPrompts.add(key);
      const groupNumber = String(group).match(/\d+/)?.[0];
      const lessonId = item.module ?? (groupNumber ? `${files[0].startsWith('lesson')?'lesson':'module'}-${groupNumber.padStart(2,'0')}` : lessons[0].id);
      if (!lessons.some(l => l.id === lessonId)) throw new Error(`Question has no lesson: ${source.courseId}/${lessonId}`);
      return {id:`${source.courseId}:${item.id ?? index+1}`,lesson_id:lessonId,prompt:item.prompt,choices:[...item.choices],solution:item.correctChoice,explanation:item.rationale,sources:item.sources ?? []};
    }).filter(Boolean);
    if (!questions.length) throw new Error(`No formative questions: ${source.courseId}`);
    const practice_url = `free-practice/courses/${course.course_id}.json`;
    const payload = {course_id:course.course_id,course_title:course.course_title,state_code:state.state_code,state_name:state.state_name,coverage:source.coverage,lessons,questions};
    write(practice_url,JSON.stringify(payload,null,2)+'\n');
    samples.push({state_code:state.state_code,state_name:state.state_name,course_id:course.course_id,course_title:course.course_title,public_status:state.public_status,content_url:lessons[0].content_url,practice_url,lesson_count:lessons.length,question_count:questions.length,coverage:source.coverage,revision:digest(JSON.stringify(payload)).slice(0,16)});
  }
  const manifest = {schema_version:'2.0',generated_from:['state-registry.json','course-catalog.json','explicit student curriculum and formative exercise allowlist'],disclosure:'Free preview and formative practice only. No enrollment, regulated study time, licensing credit, certificate, or access to a course final examination is created.',samples};
  write('data/free-practice-catalog.json',JSON.stringify(manifest,null,2)+'\n');
  return manifest;
}
