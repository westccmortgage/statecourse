export function validatePracticePayload(payload) {
  const fail=message=>{throw Error(`Invalid public practice ${payload.course_id}: ${message}`);};
  if(!payload.state_code||!payload.lessons?.length||!payload.questions?.length)fail('missing state, lessons or questions');
  const ids=new Set(),prompts=new Set();
  for(const q of payload.questions){
    if(q.state_code!==payload.state_code)fail('cross-state question');
    if(!q.id?.startsWith(payload.course_id+':')||ids.has(q.id))fail('duplicate or foreign ID');
    ids.add(q.id);
    const prompt=q.prompt?.trim().toLowerCase();
    if(!prompt||prompts.has(prompt))fail('empty or duplicate prompt');
    prompts.add(prompt);
    if(!Array.isArray(q.choices)||q.choices.length!==4||q.choices.some(c=>typeof c!=='string'||!c.trim())||new Set(q.choices).size!==4)fail('four distinct choices required');
    if(!Number.isInteger(q.solution)||q.solution<0||q.solution>3||!q.explanation?.trim())fail('answer and explanation required');
    if(!q.category?.trim()||!q.curriculum_reference||!Array.isArray(q.sources))fail('topic and reference metadata required');
    if(!payload.lessons.some(l=>l.id===q.lesson_id))fail('unknown lesson');
  }
  if(payload.credit_eligible!==false||payload.certificate_available!==false||payload.account_required!==false)fail('non-credit/no-account boundary required');
  return payload;
}
