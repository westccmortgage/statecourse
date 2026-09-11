import test from 'node:test';
import assert from 'node:assert/strict';
import reviewExams from '../netlify/functions/student-review-exams.mts';

const USER='11111111-1111-4111-8111-111111111111';
const COURSE='ca-real-estate-principles-45';
const active = {course_id:COURSE,access_role:'regulator_reviewer',active:true,expires_at:null};
async function run(grants,fn) {
  const oldFetch=globalThis.fetch;
  const oldEnv={};
  for(const key of ['SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY'])oldEnv[key]=process.env[key];
  process.env.SUPABASE_URL='https://dre-example.supabase.co';
  process.env.SUPABASE_ANON_KEY='sb_publishable_example';
  process.env.SUPABASE_SERVICE_ROLE_KEY='sb_secret_example';
  const calls=[];
  globalThis.fetch=async (url,options={})=>{
    const parsed=new URL(url);calls.push({url:parsed,method:options.method||'GET'});
    if(parsed.pathname==='/auth/v1/user')return Response.json({id:USER,email:'dre-regulator-review@statecourse.com',user_metadata:{role:'owner'}});
    if(parsed.pathname==='/rest/v1/students')return Response.json(null);
    if(parsed.pathname==='/rest/v1/course_review_access'){
      assert.equal(parsed.searchParams.get('user_id'),'eq.'+USER);
      return Response.json(grants);
    }
    throw new Error('Unexpected database operation');
  };
  try {await fn(calls);}finally{globalThis.fetch=oldFetch;for(const[key,value]of Object.entries(oldEnv)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
}
function request(query='',method='GET',signedIn=true){return new Request('https://statecourse.com/api/student/review-exams'+query,{method,headers:signedIn?{cookie:'__Host-sc_access=review-session'}:{}});}

test('anonymous callers receive no examination data',async()=>{
  await run([active],async calls=>{const response=await reviewExams(request('', 'GET',false));assert.equal(response.status,401);assert.equal(calls.length,0);assert.deepEqual(Object.keys(await response.json()),['error']);});
});
test('a sample student or an owner label in metadata does not grant examination review',async()=>{
  await run([],async()=>{const response=await reviewExams(request());assert.equal(response.status,403);assert.deepEqual(await response.json(),{error:'course_review_access_required'});});
});
test('the regulator reads both forms of all three courses without an exam session or progress writes',async()=>{
  const courseIds=[COURSE,'ca-real-estate-practice-45','ca-mortgage-loan-brokering-lending-45'];
  await run(courseIds.map(course_id=>({...active,course_id})),async calls=>{
    for(const courseId of courseIds)for(const form of ['A','B']){
      const response=await reviewExams(request(`?course_id=${courseId}&form=${form}`));
      assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');
      const data=await response.json();assert.equal(data.exam.items.length,100);assert.equal(data.course.courseId,courseId);assert.equal(data.exam.form,form);
      assert.ok(data.exam.items.every(item=>Number.isInteger(item.correctChoice)&&item.correctChoice>=0&&item.correctChoice<item.choices.length&&item.source));
    }
    assert.ok(calls.every(call=>call.method==='GET'||call.url.pathname==='/rest/v1/students'));
    assert.ok(!calls.some(call=>/enrollments|exam_sessions|progress|completion/.test(call.url.pathname)));
  });
});
test('revoked, expired, invalid-date and unknown-role grants never expose an examination',async()=>{
  for(const grant of [{...active,active:false},{...active,expires_at:'2020-01-01'},{...active,expires_at:'invalid'},{...active,access_role:'student'}]){
    await run([grant],async()=>assert.equal((await reviewExams(request())).status,403));
  }
});
test('a course-scoped grant does not open another course by changing the URL',async()=>{
  await run([active],async()=>{const response=await reviewExams(request('?course_id=ca-real-estate-practice-45'));assert.equal(response.status,403);assert.deepEqual(Object.keys(await response.json()),['error']);});
});
test('invalid form and all mutation methods are refused',async()=>{
  await run([active],async()=>assert.equal((await reviewExams(request('?form=C'))).status,400));
  for(const method of ['POST','PUT','PATCH','DELETE'])await run([active],async calls=>{assert.equal((await reviewExams(request('',method))).status,405);assert.equal(calls.length,0);});
});
