import { dbRequest } from './db.mjs';
import { courseEntry } from '../../../public/statecourse/course-entry-context.mjs';

export async function saveCourseInterest(studentId,input) {
  const entry=courseEntry(input);
  if(!entry || (input.notify!==undefined&&typeof input.notify!=='boolean'))throw Object.assign(new Error('invalid_learning_path'),{statusCode:400});
  const now=new Date().toISOString();
  const body={student_id:studentId,state:entry.state,license_goal:`course-entry:${entry.vertical}:${entry.goal}`,
    steps:[{id:'course-availability',vertical:entry.vertical,goal:entry.goal,notification_requested:input.notify===true,
      ...(input.notify===true?{consent:'Email me when this learning path is available.',consent_version:'course-availability-v1',requested_at:now}:{}),recorded_at:now}],updated_at:now};
  // A normal revisit must never erase a prior explicit notification request.
  await dbRequest('licensing_navigator_state?on_conflict=student_id,state,license_goal',{
    method:'POST',prefer:`resolution=${input.notify===true?'merge':'ignore'}-duplicates,return=minimal`,body});
  return entry;
}
