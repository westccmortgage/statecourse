import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { splitSections } from '../public/statecourse/practice-core.mjs';
import { renderLessonMarkdown } from '../public/statecourse/student/course/blocks/lesson-markdown.mjs';
export const sha = s => createHash('sha256').update(s).digest('hex');
export function htmlText(html) {
  return [...html.matchAll(/>([^<]+)</g)].map(m => m[1].replace(/&(amp|lt|gt|quot|#039|#39);/g, (_, e) => ({amp:'&',lt:'<',gt:'>',quot:'"','#039':"'",'#39':"'"})[e]).trim()).filter(Boolean);
}
export function collectPracticeTranslation(root, sample) {
  const publicRoot=path.join(root,'public/statecourse');
  const course=JSON.parse(fs.readFileSync(path.join(publicRoot,sample.practice_url),'utf8'));
  const strings=new Set(), files=[];
  const add=s=>{if(typeof s==='string' && /[A-Za-z]/.test(s) && !/^https?:\/\//.test(s))strings.add(s.trim());};
  function walk(value,key='') {
    if(typeof value==='string' && ['course_title','title','prompt','explanation','context','facts','choices','description','reference','unit'].includes(key)) { add(value); if(key==='context')value.split('\n').forEach(add); }
    else if(Array.isArray(value))value.forEach(v=>walk(v,key));
    else if(value && typeof value==='object')Object.entries(value).forEach(([k,v])=>walk(v,k));
  }
  walk(course);
  for(const lesson of course.lessons) {
    const markdown=fs.readFileSync(path.join(publicRoot,lesson.content_url),'utf8');
    if(sha(markdown)!==lesson.sha256)throw Error('Stale lesson: '+lesson.id);
    files.push({path:lesson.content_url,sha256:lesson.sha256});
    for(const section of splitSections(markdown)){add(section.title);htmlText('<main>'+renderLessonMarkdown(section.body)+'</main>').forEach(add);}
  }
  return {course_id:sample.course_id,revision:sample.revision,files,strings:[...strings].sort()};
}

export const numericTokens = text => text.match(/\d+(?:[.,]\d+)*|[¼½¾⅓⅔⅛⅜⅝⅞⅙⅚²³¹⁰⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉π÷×=]/g) || [];
export const referenceTokens = text => text.match(/https?:\/\/[^\s<>)]+|(?:\b(?:AS|RCW|WAC|TAC|AAC|CFR|C\.F\.R\.|A\.R\.S\.|A\.A\.C\.|N\.C\.G\.S\.|G\.S\.|C\.R\.S\.|RSMo)|§{1,2})\s*(?:§\s*)?\d(?:[\dA-Za-z.()–—-]*[\dA-Za-z)])?/g) || [];
