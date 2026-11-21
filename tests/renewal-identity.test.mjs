import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {requireCourseNmlsId} from '../netlify/functions/_lib/student-nmls-identity.mjs';

test('mortgage CE checkout checks the stored learner ID; missing or malformed profiles are refused',async t=>{
 const saved={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY:process.env.SUPABASE_SERVICE_ROLE_KEY};
 process.env.SUPABASE_URL='https://supabase.example.test';process.env.SUPABASE_SERVICE_ROLE_KEY='sb_secret_test';
 t.after(()=>{for(const [k,v]of Object.entries(saved))if(v===undefined)delete process.env[k];else process.env[k]=v;});
 let stored=null;const calls=[];
 t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url,options});return Response.json([{nmls_id:stored}]);});
 const course={productType:'mortgage_continuing_education'},student='11111111-1111-4111-8111-111111111111';
 for(const invalid of [null,'','not-an-id']){
  stored=invalid;await assert.rejects(requireCourseNmlsId(course,student),{message:'nmls_id_required',statusCode:409});
 }
 stored='123456';assert.equal(await requireCourseNmlsId(course,student),'123456');
 assert.ok(calls.every(call=>call.url.includes('students?id=eq.'+student)&&call.options.method==='GET'));
});
test('practice and real-estate paths do not acquire an NMLS or biometric prerequisite',async t=>{
 t.mock.method(globalThis,'fetch',()=>{throw Error('No identity request expected');});
 for(const productType of ['real_estate_prelicense','real_estate_continuing_education','mortgage_prelicense','free_practice'])
  assert.equal(await requireCourseNmlsId({productType},'student'),null);
});
test('checkout checks the stored NMLS ID before payment records or Stripe requests',()=>{
 const source=readFileSync(new URL('../netlify/functions/create-checkout.mjs',import.meta.url),'utf8');
 const check=source.indexOf('await requireCourseNmlsId(course, student.id)');
 assert.ok(check>source.indexOf('await resolveCheckoutStudent'));
 assert.ok(check<source.indexOf('await dbRequest("checkout_attempts"'));
 assert.ok(check<source.indexOf('await stripeRequest('));
 assert.doesNotMatch(source,/input\.nmlsId/);
});
