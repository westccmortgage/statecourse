export function splitSections(markdown) {
  const lines=String(markdown||'').replace(/\r/g,'').split('\n'), starts=[];
  lines.forEach((line,i)=>{if(/^##\s+\S/.test(line))starts.push(i);});
  if(!starts.length)return [{title:'Lesson',body:markdown}];
  const result=[], intro=lines.slice(0,starts[0]).join('\n').trim();
  if(intro.replace(/^#\s+.*$/gm,'').trim())result.push({title:'Introduction',body:intro});
  starts.forEach((start,i)=>result.push({title:lines[start].replace(/^##\s+/,''),body:lines.slice(start+1,starts[i+1]??lines.length).join('\n')}));
  // Some source files place an hour heading immediately before another heading.
  // Keep both labels on one substantive screen rather than showing a blank step.
  for(let i=result.length-1;i>=0;i--){
    if(result[i].body.trim())continue;
    if(result[i+1]){result[i+1].title=result[i].title+' — '+result[i+1].title;result.splice(i,1);}
    else if(i>0){result[i-1].body+='\n\n## '+result[i].title;result.splice(i,1);}
  }
  return result;
}
export function presentedChoices(question) {
  let seed=2166136261;
  for(const char of question.id)seed=Math.imul(seed^char.charCodeAt(0),16777619)>>>0;
  const choices=question.choices.map((text,index)=>({text,index}));
  for(let i=choices.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[choices[i],choices[j]]=[choices[j],choices[i]];}
  return choices;
}
export function gradePractice(question,selected) {
  if(!Number.isInteger(selected)||selected<0||selected>=question.choices.length)return null;
  const feedback=Array.isArray(question.choice_feedback)?question.choice_feedback[selected]:undefined;
  return {correct:selected===question.solution,selected,explanation:typeof feedback==='string'&&feedback.trim()?feedback:question.explanation};
}
export function practiceSummary(questions,answers) {
  const answered=questions.filter(q=>gradePractice(q,answers[q.id]?.selected));
  const correct=answered.filter(q=>gradePractice(q,answers[q.id].selected)?.correct).length;
  const firstCorrect=answered.filter(q=>gradePractice(q,answers[q.id].firstSelected??answers[q.id].selected)?.correct).length;
  return {total:questions.length,answered:answered.length,correct,firstCorrect,percent:answered.length?Math.round(100*correct/answered.length):0};
}

export function restorePractice(saved,questions) {
  const answers={};
  for(const q of questions){
    const value=saved?.answers?.[q.id];
    if(!value||typeof value!=='object'||!gradePractice(q,value.firstSelected??value.selected))continue;
    answers[q.id]={firstSelected:value.firstSelected??value.selected,attempts:Number.isSafeInteger(value.attempts)&&value.attempts>0?value.attempts:1};
    if(gradePractice(q,value.selected))answers[q.id].selected=value.selected;
  }
  const p=saved?.position;
  const position={lesson:typeof p?.lesson==='string'?p.lesson:null,section:Number.isSafeInteger(p?.section)&&p.section>=0?p.section:0,question:Number.isSafeInteger(p?.question)&&p.question>=0?p.question:0,mode:['quiz','activities'].includes(p?.mode)?p.mode:'read'};
  return {answers,position};
}
