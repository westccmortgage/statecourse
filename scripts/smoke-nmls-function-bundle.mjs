import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Spawned only by the offline packaging audit, with cwd set to the packaged
// task root and a minimal environment. Every HTTP request is intercepted; none
// can contact Supabase, Netlify, Stripe, Cloudflare or an external URL.
const [name]=process.argv.slice(2),definition=JSON.parse(readFileSync(0,'utf8'));
const actor='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',id='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const sessionId='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const staffProof='p'.repeat(43);
const encoded=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
const staffToken=`${encoded({alg:'none',typ:'JWT'})}.${encoded({sub:actor,session_id:sessionId,aal:'aal2',exp:Math.floor(Date.now()/1000)+3600})}.synthetic`;
const origin='https://packaged-statecourse.invalid';
Object.assign(process.env,{STATECOURSE_BASE_URL:origin,SUPABASE_URL:'https://packaged-db.invalid',
 SUPABASE_ANON_KEY:'synthetic-package-anon',SUPABASE_SERVICE_ROLE_KEY:'synthetic-package-service'});
globalThis.Netlify={env:{get:key=>process.env[key]}};
const course={id:definition.course_id,state:'US',name:'Mortgage training',current_version:definition.course_version,product_type:'mortgage_continuing_education'};
const enrollment={id,student_id:actor,course_id:course.id,state:'US',course_version:course.current_version,
 enrollment_origin:'training',status:'active',compliance_credit_eligible:false,checkout_attempt_id:null,expires_at:null,completed_at:null};
const student={id:actor,email:'package-review@example.invalid',email_confirmed_at:'2026-10-01T00:00:00.000Z',account_status:'active',user_metadata:{}};
const governance={site:'packaged-statecourse.invalid',offering_id:course.id,offering_kind:'course',state:'US',discipline:'mortgage',
 training_access_enabled:true,payment_mode:'disabled',approval_status:'none',approval_currently_effective:false,live_charging_permitted:false};
const calls=[];
const json=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json'}});
globalThis.fetch=async(url,options={})=>{
 const parsed=new URL(url);assert.equal(parsed.origin,'https://packaged-db.invalid','all networking is mocked and bounded');
 const method=options.method||'GET',resource=parsed.pathname.replace('/rest/v1/','');
 calls.push({resource,method});
 if(parsed.pathname==='/auth/v1/user')return json(student);
 if(resource==='students')return method==='POST'?new Response(null,{status:204}):json([student]);
 if(resource==='student_portal_events')return new Response(null,{status:204});
 if(resource==='current_staff_actor_bindings')return json([{auth_user_id:actor,actor_role:'owner',scope_state:null,binding_status:'active',effective_at:null,expires_at:null}]);
 if(resource==='rpc/nmls_training_definition')return json(definition);
 if(resource==='rpc/nmls_training_enroll')return json({enrollment,existing:true});
 if(resource==='rpc/nmls_training_context')return json({enrollmentId:id,studentId:actor,courseId:course.id,courseVersion:course.current_version,
  contentDigest:definition.content_digest,definitionDigest:definition.definition_digest,reviewRole:name==='student-nmls-training'?'regulator_reviewer':null,
  revision:0,runtime:null,event:null,serverTimeMs:Date.now()});
 if(resource==='rpc/statecourse_staff_security')return json({ok:true});
 assert.equal(method,'GET',`unexpected write ${resource}`);
 if(resource==='courses')return json([course]);
 if(resource==='enrollments')return json([enrollment]);
 if(resource==='student_portal_enrollments')return json([{...enrollment,enrollment_id:id,enrollment_status:'active',access_status:'active'}]);
 if(resource==='offering_public_status')return json([governance]);
 if(resource==='nmls_training_definitions')return json([definition]);
 if(resource==='nmls_training_attempts')return json([]);
 return json([]);
};
const module=await import(pathToFileURL(resolve('netlify/functions',`${name}.mjs`)).href);
assert.equal(typeof module.default,'function');
const routes={
 'student-nmls-training':['/api/student/nmls/training'], 'admin-workspace':['/api/admin/workspace'],
 'enroll-training':['/api/enroll/training','/.netlify/functions/enroll-training'],
 'student-portal':['/api/student/portal','/.netlify/functions/student-portal'],
};
assert.deepEqual([module.config.path].flat(),routes[name]);
const post=['student-nmls-training','enroll-training'].includes(name),requestBody=name==='student-nmls-training'?
 {operation:'snapshot',command:{enrollmentId:id}}:{courseId:course.id};
const request=(authenticated=true)=>new Request(origin+routes[name][0],{method:post?'POST':'GET',headers:{origin,
 ...(post?{'content-type':'application/json'}:{}),...(authenticated?{authorization:`Bearer ${name==='admin-workspace'?staffToken:'synthetic-package-user'}`,
  ...(name==='admin-workspace'?{cookie:`__Host-sc_staff=${staffProof}`}:{})}:{})},
 ...(post?{body:JSON.stringify(requestBody)}:{})});
const denied=await module.default(request(false));assert.equal(denied.status,401);
if(name==='admin-workspace')assert.deepEqual(calls.map(call=>call.resource),['rpc/statecourse_staff_security']);
else assert.equal(calls.length,0);
const response=await module.default(request()),body=await response.json();assert.equal(response.status,200,JSON.stringify(body));
assert.match(response.headers.get('cache-control')||'',/no-store/);
assert.match(response.headers.get('content-type')||'',/application\/json/);
assert.doesNotMatch(JSON.stringify(body),/correctChoice|"answers"|"rationale"|N26-FIN-|synthetic-package-(?:anon|service|user)/);
let detail;
if(name==='student-nmls-training'){
 assert.equal(body.readOnly,true);assert.equal(body.review.modules.flatMap(m=>m.lessons).length,45);
 assert.equal(body.review.assessmentRules.bankCount,50);assert.equal(body.nmlsCreditEligible,false);
 detail={lessons:45,privateFinalBankLoaded:50,readOnly:true};
}else if(name==='admin-workspace'){
 const n=body.result.nmls;
 assert.equal(n.curriculum.structurallyComplete,true);assert.equal(n.curriculum.lessonCount,45);assert.equal(n.curriculum.formativeQuestionCount,123);
 assert.equal(n.officialEvidence.retainedHtmlCount,19);assert.equal(n.officialEvidence.aiReviewedHtmlCount,19);
 assert.equal(n.officialEvidence.unresolvedOriginalCount,2);assert.equal(n.creditIssuanceAllowed,false);
 detail={lessons:45,formativeQuestions:123,retainedHtml:19,unresolvedPdf:2};
}else if(name==='enroll-training'){
 assert.equal(body.existing,true);assert.equal(body.paidNothing,true);assert.equal(body.creditEligible,false);
 assert.match(body.href,/^\/student\/nmls-training\/\?enrollment_id=/);
 detail={realDefinitionVerified:true,existingNoncreditEnrollment:true};
}else{
 assert.equal(body.enrollments[0].nmls_training.available,true);assert.equal(body.enrollments[0].nmls_training.totalUnits,45);
 assert.equal(body.enrollments[0].nmls_training.creditEarned,false);
 detail={realDefinitionVerified:true,portalLessons:45};
}
console.log(JSON.stringify({name,routes:routes[name],authenticationRequired:true,privateResponse:true,calls:calls.length,...detail}));
