import test from 'node:test';
import assert from 'node:assert/strict';
import {courseEntry,entryPath,entryFromReturnPath} from '../public/statecourse/course-entry-context.mjs';
import {saveCourseInterest} from '../netlify/functions/_lib/course-interest.mjs';
import learningPath from '../netlify/functions/student-learning-path.mjs';
import {registerStudent} from '../netlify/functions/_lib/student-session.mjs';

const entry={vertical:'mortgage',goal:'renew',state:'CA'};
const uid='11111111-1111-4111-8111-111111111111';
async function backend(t,run,{signupFailure=null,dbFailure=false}={}){
 const keys=['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_PUBLISHABLE_KEY','SUPABASE_SERVICE_ROLE_KEY','STATECOURSE_BASE_URL'];
 const saved=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 Object.assign(process.env,{SUPABASE_URL:'https://supabase.example.test',SUPABASE_ANON_KEY:'sb_publishable_test',SUPABASE_PUBLISHABLE_KEY:'sb_publishable_test',SUPABASE_SERVICE_ROLE_KEY:'sb_secret_test',STATECOURSE_BASE_URL:'https://statecourse.com'});
 t.after(()=>{for(const [k,v]of Object.entries(saved)){if(v===undefined)delete process.env[k];else process.env[k]=v;}});
 const calls=[];
 t.mock.method(globalThis,'fetch',async(url,options={})=>{
  calls.push({url,...options});
  if(url.includes('/auth/v1/signup'))return Response.json(signupFailure?.body||{id:uid,email:'student@example.test'},{status:signupFailure?.status||200});
  if(url.endsWith('/auth/v1/user'))return Response.json({id:uid,email:'student@example.test'});
  if(url.includes('licensing_navigator_state')&&dbFailure)return Response.json({message:'database offline'},{status:503});
  return new Response(null,{status:204});
 });await run(calls);
}
const request=(body,headers={origin:'https://statecourse.com',cookie:'__Host-sc_access=test-user-token'})=>new Request('https://statecourse.com/api/student/learning-path',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});

test('all six entry scenarios round-trip without losing vertical, goal or state',()=>{
 for(const vertical of ['real-estate','mortgage'])for(const goal of ['practice','licensed','renew']){
  const e={vertical,goal,state:'TX'};assert.deepEqual(entryFromReturnPath(entryPath(e)),e);
 }
});
test('invalid states, ambiguous goals and external return paths cannot become a saved path',()=>{
 for(const bad of [{...entry,vertical:'admin'},{...entry,goal:'exam'},{...entry,state:'ZZ'},null])assert.equal(courseEntry(bad),null);
 for(const bad of ['https://evil.test/student/start/?vertical=mortgage&goal=renew&state=CA','//evil.test/','/\\evil.test/','/student/start/../password/?vertical=mortgage&goal=renew&state=CA','/student/start/?vertical=mortgage&goal=renew&state=ZZ'])assert.equal(entryFromReturnPath(bad),null);
});
test('ordinary selection never overwrites an existing explicit notification request',async t=>backend(t,async calls=>{
 await saveCourseInterest(uid,entry);
 assert.match(calls[0].prefer||calls[0].headers.prefer,/ignore-duplicates/);
 const row=JSON.parse(calls[0].body);assert.equal(row.student_id,uid);assert.equal(row.state,'CA');assert.equal(row.license_goal,'course-entry:mortgage:renew');assert.equal(row.steps[0].notification_requested,false);
}));
test('Notify Me records explicit, versioned consent in the existing navigator table',async t=>backend(t,async calls=>{
 await saveCourseInterest(uid,{...entry,notify:true});const row=JSON.parse(calls[0].body);
 assert.match(calls[0].headers.prefer,/merge-duplicates/);assert.equal(row.steps[0].notification_requested,true);assert.equal(row.steps[0].consent_version,'course-availability-v1');
 assert.ok(Date.parse(row.steps[0].requested_at));assert.equal(calls.length,1);assert.match(calls[0].url,/licensing_navigator_state/);
}));
test('authenticated endpoint ignores client-supplied identity and writes no enrollment or credit',async t=>backend(t,async calls=>{
 const r=await learningPath(request({...entry,notify:true,student_id:'someone-else',approved:true}));assert.equal(r.status,200);
 const writes=calls.filter(c=>c.url.includes('licensing_navigator_state'));assert.equal(writes.length,1);assert.equal(JSON.parse(writes[0].body).student_id,uid);
 assert.equal(calls.some(c=>/enrollments|payments|access_grants|completion/.test(c.url)),false);
}));
test('anonymous and cross-origin notification requests cannot write preferences',async t=>backend(t,async calls=>{
 assert.equal((await learningPath(request(entry,{origin:'https://statecourse.com'}))).status,401);
 assert.equal((await learningPath(request(entry,{origin:'https://evil.test',cookie:'__Host-sc_access=x'}))).status,403);
 assert.equal(calls.length,0);
}));
test('invalid notification input and failed persistence never report success',async t=>backend(t,async()=>{
 assert.equal((await learningPath(request({...entry,notify:'yes'}))).status,400);
 const r=await learningPath(request({...entry,notify:true}));assert.equal(r.status,503);assert.equal((await r.json()).error,'learning_path_unavailable');
},{dbFailure:true}));
test('signup preserves the selected path through confirmation and captures interest without notification consent',async t=>backend(t,async calls=>{
 const r=await registerStudent({email:'student@example.test',firstName:'Sample',lastName:'Student',password:'test-only-long-password',returnTo:entryPath(entry)});
 assert.equal(r.confirmationRequired,true);
 const auth=JSON.parse(calls[0].body);assert.deepEqual(auth.data.learning_path,entry);assert.equal(auth.data.nmls_id,undefined);
 const confirmation=new URL(calls[0].url).searchParams.get('redirect_to');assert.equal(new URL(confirmation).searchParams.get('return_to'),entryPath(entry));
 const row=JSON.parse(calls.find(c=>c.url.includes('licensing_navigator_state')).body);assert.equal(row.steps[0].notification_requested,false);
}));
test('SMTP failure creates no preference or misleading success',async t=>backend(t,async calls=>{
 await assert.rejects(registerStudent({email:'student@example.test',firstName:'Sample',lastName:'Student',password:'test-only-long-password',returnTo:entryPath(entry)}),/student_auth_unavailable/);assert.equal(calls.length,1);
},{signupFailure:{status:500,body:{code:'unexpected_failure'}}}));
test('weak-password refusal remains an actionable validation error',async t=>backend(t,async()=>{
 await assert.rejects(registerStudent({email:'student@example.test',firstName:'Sample',lastName:'Student',password:'test-only-long-password'}),{message:'weak_password',statusCode:422});
},{signupFailure:{status:422,body:{code:'weak_password'}}}));
