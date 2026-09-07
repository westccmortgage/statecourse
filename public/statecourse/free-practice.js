import { renderLessonMarkdown, escapeHtml as esc } from './student/course/blocks/lesson-markdown.mjs';
import { splitSections, presentedChoices, gradePractice, practiceSummary, restorePractice } from './practice-core.mjs';
const base=new URL('./',import.meta.url), $=id=>document.getElementById(id);
const stateSelect=$('practiceStateSelect'), courseSelect=$('practiceCourseSelect'), lessonSelect=$('practiceLessonSelect');
const content=$('practiceContent'), quiz=$('practiceQuiz'), message=$('practiceMessage');
let samples=[], sample=null, course=null, sections=[], sectionIndex=0, questionIndex=0, mode='read', answers={}, position={}, pending=null, requestId=0;
const storageKey=()=> 'statecourse:free-practice:v2:'+sample.course_id+':'+sample.revision;
const currentQuestions=()=>course?.questions.filter(q=>q.lesson_id===lessonSelect.value)??[];
function save(){
  if(!sample||!course)return;
  position={lesson:lessonSelect.value,section:sectionIndex,question:questionIndex,mode};
  try{localStorage.setItem(storageKey(),JSON.stringify({answers,position}));}catch{}
}
function updateUrl(){
  const url=new URL(location.href);
  for(const [key,value] of Object.entries({state:sample.state_code,course:sample.course_id,lesson:lessonSelect.value,mode}))url.searchParams.set(key,value);
  history.replaceState({},'',url);
}
function progress(){
  const s=practiceSummary(currentQuestions(),answers), all=practiceSummary(course.questions,answers);
  $('practiceProgress').textContent='Lesson: '+s.answered+'/'+s.total+' answered · '+s.correct+' correct. Course practice: '+all.answered+'/'+all.total+' answered · '+all.firstCorrect+' correct on the first try.';
}
function renderQuestion(){
  const questions=currentQuestions();
  if(!questions.length){quiz.innerHTML='<p>This lesson has no separate quiz. Continue to the next lesson for more practice.</p>';return;}
  questionIndex=Math.max(0,Math.min(questionIndex,questions.length-1));
  const q=questions[questionIndex], answer=answers[q.id], result=answer&&gradePractice(q,answer.selected), s=practiceSummary(questions,answers);
  quiz.innerHTML='<p class="practice-question-count">Question '+(questionIndex+1)+' of '+questions.length+'</p>'+
    '<form id="practiceAnswerForm"><fieldset '+(result?'disabled':'')+'><legend>'+esc(q.prompt)+'</legend>'+
    presentedChoices(q).map(({text,index})=>'<label class="practice-answer"><input type="radio" name="answer" value="'+index+'" '+(answer?.selected===index?'checked':'')+' required aria-describedby="practiceFeedback"/><span>'+esc(text)+'</span></label>').join('')+
    '<button type="submit" class="cta-button" '+(result?'hidden':'')+'>Check answer</button></fieldset></form>'+
    '<div id="practiceFeedback" class="practice-feedback '+(result?(result.correct?'is-correct':'is-incorrect'):'')+'" role="status">'+
    (result?'<strong>'+(result.correct?'Correct.':'Review this answer.')+'</strong><p>'+esc(result.explanation)+'</p>'+
      (result.correct?'':'<p><strong>Correct answer:</strong> '+esc(q.choices[q.solution])+'</p><button type="button" data-action="retry">Try again</button>'):'')+'</div>'+
    (result&&q.sources?.length?'<p class="practice-sources">Sources: '+q.sources.filter(s=>/^https:\/\//.test(s.url)).map(s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.reference||'Official source')+'</a>').join(' · ')+'</p>':'')+
    '<nav class="practice-question-nav" aria-label="Practice questions"><button type="button" data-action="previous-question" '+(questionIndex===0?'disabled':'')+'>← Previous question</button><button type="button" data-action="read">Review lesson</button><button type="button" data-action="next-question" '+(questionIndex===questions.length-1?'disabled':'')+'>Next question →</button></nav>'+
    (s.answered===s.total?'<div class="practice-summary" role="status"><h3>Practice round complete</h3><p>'+s.correct+' of '+s.total+' correct ('+s.percent+'%). First try: '+s.firstCorrect+' of '+s.total+'.</p><button type="button" data-action="reset">Restart this lesson’s questions</button></div>':'');
}
function render(){
  if(!course||!sections.length)return;
  sectionIndex=Math.max(0,Math.min(sectionIndex,sections.length-1));
  const section=sections[sectionIndex];
  content.innerHTML='<h2>'+esc(section.title)+'</h2>'+renderLessonMarkdown(section.body);
  content.hidden=mode!=='read';quiz.hidden=mode!=='quiz';$('practiceSectionNav').hidden=mode!=='read';
  $('practiceSectionLabel').textContent='Section '+(sectionIndex+1)+' of '+sections.length;
  $('practicePrevious').disabled=sectionIndex===0;$('practiceNext').disabled=sectionIndex===sections.length-1;
  $('practiceReadMode').setAttribute('aria-pressed',String(mode==='read'));$('practiceQuizMode').setAttribute('aria-pressed',String(mode==='quiz'));
  $('practiceQuizMode').textContent='Practice questions ('+currentQuestions().length+')';
  const i=course.lessons.findIndex(l=>l.id===lessonSelect.value);
  $('practicePreviousLesson').disabled=i===0;$('practiceNextLesson').disabled=i===course.lessons.length-1;
  $('practiceBottomNav').hidden=false;$('practiceMode').hidden=false;
  if(mode==='quiz')renderQuestion();progress();save();updateUrl();
}
async function openLesson(id,restore=false){
  const lesson=course?.lessons.find(l=>l.id===id);if(!lesson)return;
  const token=++requestId;pending?.abort();pending=new AbortController();
  lessonSelect.value=id;message.textContent='Loading lesson…';content.replaceChildren();quiz.replaceChildren();
  for(const id of ['practiceSectionNav','practiceMode','practiceBottomNav'])$(id).hidden=true;
  try{
    const lessonUrl=new URL(lesson.content_url,base);lessonUrl.searchParams.set('v',lesson.sha256);
    const response=await fetch(lessonUrl,{signal:pending.signal});if(!response.ok)throw Error('Lesson unavailable');
    const markdown=await response.text();if(token!==requestId)return;
    sections=splitSections(markdown);sectionIndex=restore&&position.lesson===id?position.section??0:0;questionIndex=restore&&position.lesson===id?position.question??0:0;
    message.textContent=(course.coverage==='practice collection'?'Focused practice collection; the full qualifying course is still being written.':'Read the available curriculum at your own pace.')+' These exercises are formative practice, not a licensing examination.';
    render();
  }catch(error){if(error.name!=='AbortError')message.textContent='Could not load this lesson. Select it again to retry.';}
}
async function openCourse(id,requestedLesson=null,requestedMode=null){
  const entry=samples.find(s=>s.course_id===id);if(!entry)return;
  const token=++requestId;pending?.abort();pending=new AbortController();sample=entry;course=null;answers={};position={};sections=[];
  courseSelect.value=id;lessonSelect.disabled=true;lessonSelect.replaceChildren();
  for(const id of ['practiceSectionNav','practiceMode','practiceBottomNav'])$(id).hidden=true;
  content.replaceChildren();quiz.replaceChildren();$('practiceProgress').textContent='';
  $('practiceStateLabel').textContent=sample.state_name+' · In development · Free practice';$('practiceCourseTitle').textContent=sample.course_title;
  message.textContent='Loading course…';
  $('practiceRecord').innerHTML='<div><dt>Access</dt><dd>Free · no account required</dd></div><div><dt>Material</dt><dd>'+sample.lesson_count+' lessons · '+sample.question_count+' questions</dd></div><div><dt>Credit</dt><dd>None — practice only</dd></div>';
  $('practiceStatePath').href=new URL('real-estate/'+sample.state_name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/',base);$('practiceStatePath').hidden=false;
  try{
    const courseUrl=new URL(sample.practice_url,base);courseUrl.searchParams.set('v',sample.revision);
    const response=await fetch(courseUrl,{signal:pending.signal});if(!response.ok)throw Error('Course unavailable');
    const data=await response.json();if(token!==requestId)return;course=data;
    try{({answers,position}=restorePractice(JSON.parse(localStorage.getItem(storageKey())||'{}'),course.questions));}catch{answers={};position={};}
    for(const [i,l] of course.lessons.entries())lessonSelect.add(new Option((i+1)+'. '+l.title,l.id));
    lessonSelect.disabled=false;mode=requestedMode==='quiz'||(!requestedMode&&position.mode==='quiz')?'quiz':'read';
    const lessonId=course.lessons.find(l=>l.id===requestedLesson)?.id??course.lessons.find(l=>l.id===position.lesson)?.id??course.lessons[0].id;
    await openLesson(lessonId,true);document.title=sample.course_title+' — Free Practice | StateCourse';
  }catch(error){if(error.name!=='AbortError')message.textContent='Could not load this course. Select it again to retry.';}
}
async function selectState(code,courseId=null,lessonId=null,requestedMode=null){
  const available=samples.filter(s=>s.state_code===code);if(!available.length)return;
  stateSelect.value=code;courseSelect.replaceChildren();courseSelect.disabled=false;
  available.forEach(s=>courseSelect.add(new Option(s.course_title,s.course_id)));
  await openCourse(available.find(s=>s.course_id===courseId)?.course_id??available[0].course_id,lessonId,requestedMode);
}
stateSelect.addEventListener('change',()=>selectState(stateSelect.value));
courseSelect.addEventListener('change',()=>openCourse(courseSelect.value));
lessonSelect.addEventListener('change',()=>openLesson(lessonSelect.value));
$('practiceReadMode').addEventListener('click',()=>{mode='read';render();});
$('practiceQuizMode').addEventListener('click',()=>{mode='quiz';render();});
$('practicePrevious').addEventListener('click',()=>{sectionIndex--;render();content.focus({preventScroll:true});});
$('practiceNext').addEventListener('click',()=>{sectionIndex++;render();content.focus({preventScroll:true});});
for(const [id,d] of [['practicePreviousLesson',-1],['practiceNextLesson',1]])$(id).addEventListener('click',()=>{const i=course.lessons.findIndex(l=>l.id===lessonSelect.value);openLesson(course.lessons[i+d]?.id);});
quiz.addEventListener('submit',event=>{
  event.preventDefault();const raw=new FormData(event.target).get('answer'),q=currentQuestions()[questionIndex];
  const result=gradePractice(q,raw===null?null:Number(raw));
  if(!result){$('practiceFeedback').textContent='Choose an answer before checking.';return;}
  const prior=answers[q.id];answers[q.id]={selected:result.selected,firstSelected:prior?.firstSelected??result.selected,attempts:(prior?.attempts??0)+1};
  renderQuestion();progress();save();$('practiceFeedback').tabIndex=-1;$('practiceFeedback').focus({preventScroll:true});
});
quiz.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;if(!action)return;
  const q=currentQuestions()[questionIndex];
  if(action==='next-question')questionIndex++;if(action==='previous-question')questionIndex--;
  if(action==='retry')delete answers[q.id].selected;if(action==='read')mode='read';
  if(action==='reset'){for(const item of currentQuestions())delete answers[item.id];questionIndex=0;}
  render();
  const focusTarget=action==='read'?content:quiz.querySelector('legend');if(focusTarget){focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true});}
});
async function restoreUrl(){const p=new URL(location.href).searchParams,byCourse=samples.find(s=>s.course_id===p.get('course')),code=byCourse?.state_code??p.get('state')?.toUpperCase();if(code)await selectState(code,p.get('course'),p.get('lesson'),p.get('mode'));}
window.addEventListener('popstate',restoreUrl);
async function load(){
  try{
    const response=await fetch(new URL('data/free-practice-catalog.json',base),{cache:'no-store'});if(!response.ok)throw Error('Catalog unavailable');
    ({samples}=await response.json());const states=[...new Map(samples.map(s=>[s.state_code,s])).values()].sort((a,b)=>a.state_name.localeCompare(b.state_name));
    stateSelect.options[0].disabled=true;
    states.forEach(s=>stateSelect.add(new Option(s.state_name+' — In development · Free practice',s.state_code)));await restoreUrl();
  }catch{message.textContent='Free practice could not load. Refresh the page to retry.';}
}
load();
