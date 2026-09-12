// Execute the production player in an isolated DOM; no production course progress is changed.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {renderLessonMarkdown,splitPracticeHtml,escapeHtml} from '../public/statecourse/student/course/blocks/lesson-markdown.mjs';
const {JSDOM}=await import(pathToFileURL(process.argv[2]));
const root=new URL('../public/statecourse/student/course/blocks/',import.meta.url);
const html=await fs.readFile(new URL('index.html',root),'utf8');
const script=(await fs.readFile(new URL('block-player.js',root),'utf8')).replace(/^import .*;\n/gm,'');
let checks=0;
for(const stage of ['reading','completed','last']) {
  const dom=new JSDOM(html,{url:'https://statecourse.test/student/course/blocks/?enrollment_id=33333333-3333-4333-8333-333333333333&assignment=module-01',runScripts:'outside-only'});
  const w=dom.window;Object.assign(w,{renderLessonMarkdown,splitPracticeHtml,escapeHtml});w.scrollTo=()=>{};
  const done=stage!=='reading',next=stage==='completed'?'/student/course/blocks/?enrollment_id=33333333-3333-4333-8333-333333333333&assignment=module-02':null;
  const payload={mode:'student',reviewNotice:null,course:{title:'Texas Law of Agency'},assignment:{sequence:1,of:12,contentPath:'/content/module-01.md'},
    header:{courseProgress:{completed:done?1:0,total:12},currentAssignment:{mastered:done?1:0,blocks:1},studyTimeSeconds:done?600:0},
    trainingModule:{completed:done,remainingStudySeconds:done?0:600,nextHref:next,lastModule:stage==='last'},
    blocks:[{id:'recap',sequence:1,title:'Module recap',status:done?'MASTERED':'IN_PROGRESS',screens:[{id:'recap-s1',sequence:1,type:'review',title:'Review',completed:done,bodyMarkdown:'The module summary.',content:{startLine:1,endLine:1}}]}],
    position:{blockId:'recap',screenId:'recap-s1'}};
  w.fetch=async(url,options={})=>({ok:true,status:200,json:async()=>String(url).startsWith('/api/student/blocks')?payload:{creditedSeconds:0,moduleCompleted:done},text:async()=>'The module summary.'});
  try{
    w.eval(script);for(let i=0;i<12;i++)await new Promise(r=>setImmediate(r));
    assert.equal(w.document.querySelector('#playerShell').hidden,false);checks++;
    assert.match(w.document.querySelector('#assignmentPosition').textContent,/Module 1 of 12/);checks++;
    const status=w.document.querySelector('#trainingModuleStatus'),link=w.document.querySelector('#nextTrainingModule');
    assert.equal(status.hidden,false);checks++;
    assert.equal(link.hidden,stage!=='completed');checks++;
    if(stage==='reading'){assert.match(status.textContent,/10 min/);assert.equal(link.hasAttribute('href'),false);checks+=2;}
    if(stage==='completed'){assert.match(link.href,/assignment=module-02$/);checks++;}
    if(stage==='last'){assert.match(status.textContent,/does not award licensing credit or a certificate/);checks++;}
  }finally{w.close();}
}
console.log(JSON.stringify({playerDomChecks:checks,passed:checks,productionTouched:false}));
