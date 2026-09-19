import test from 'node:test';
import assert from 'node:assert/strict';
import { nmlsAdministrativeProgress } from '../netlify/functions/_lib/nmls-training-service.mjs';
import { enrollmentClassification, readNmlsLearning } from '../netlify/functions/_lib/console-learning.mjs';
import { NMLS_TRAINING_COURSE as course } from '../config/nmls-course-identity.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';
import { startNmlsCourseReview } from '../lib/nmls-review-runtime.mjs';

const enrollment = { id: '11111111-1111-4111-8111-111111111111', student_id: '22222222-2222-4222-8222-222222222222',
  course_id: course.id, course_version: course.version, state: 'US', enrollment_origin: 'training', compliance_credit_eligible: false, status: 'active', review_role: null };
function fixture() {
  return { enrollment_id: enrollment.id, student_id: enrollment.student_id, course_id: course.id, course_version: course.version,
    revision: 0, runtime: null, updated_at: '2026-09-19T00:00:00Z' };
}
test('NMLS admin displays 45 lessons and 8 modules, never eight California blocks', () => {
  const p = nmlsAdministrativeProgress(fixture(), enrollment);
  assert.deepEqual([p.completed,p.total,p.totalModules,p.unit,p.phase], [0,45,8,'lessons','not_started']);
  assert.equal(p.creditEligible,false); assert.equal(p.certificateEligible,false); assert.equal(p.lastActivity,null);
});
test('NMLS scope and version mismatches are rejected rather than zero progress', () => {
  for (const patch of [{course_id:'ca-mortgage-loan-brokering-lending-45'},{course_version:'2026.2'},{state:'CA'},{compliance_credit_eligible:true}])
    assert.throws(()=>nmlsAdministrativeProgress(fixture(),{...enrollment,...patch}));
  assert.throws(()=>nmlsAdministrativeProgress({...fixture(),student_id:'wrong'},enrollment));
});
test('NMLS runtime history is validated, including forged completion and unknown lessons', () => {
  const content=getNmlsReviewCourse(course.contentKey), def=getNmlsDraftFinalDefinition(course.contentKey);
  const row={...fixture(),revision:1,runtime:{schema:'nmls-free-training-runtime-v1',purpose:'free_training',courseId:course.id,courseVersion:course.version,
    sourceCourseKey:course.contentKey,contentDigest:course.contentDigest,definitionDigest:def.digest,revision:1,phase:'source',
    source:startNmlsCourseReview(content),remediation:null,finals:[]}};
  const p=nmlsAdministrativeProgress(row,enrollment);
  assert.equal(p.lastActivity,row.updated_at);
  assert.doesNotMatch(JSON.stringify(p),/"(?:answers|selection|questionIds|stem|options|content|correctChoice)":/);
  for(const mutate of [r=>r.runtime.phase='passed',r=>r.runtime.source.completedUnitIds=['fake'],r=>r.runtime.contentDigest='fake']) {
    const invalid=structuredClone(row);mutate(invalid);assert.throws(()=>nmlsAdministrativeProgress(invalid,enrollment));
  }
});
test('NMLS adapter reads only its own attempt table and never exposes raw runtime',async()=>{
  const calls=[];const p=await readNmlsLearning(enrollment,async path=>{calls.push(path);return{available:true,truncated:false,rows:[fixture()]};});
  assert.equal(p.available,true);assert.equal(calls.length,1);assert.match(calls[0],/^nmls_training_attempts\?/);assert.equal(p.runtime,undefined);
  for(const rows of [[],[fixture(),fixture()]])assert.equal((await readNmlsLearning(enrollment,async()=>({available:true,rows}))).available,false);
});
test('training, reviewer, QA, paid and expired classifications remain independent',()=>{
  assert.equal(enrollmentClassification(enrollment).kind,'training');
  assert.equal(enrollmentClassification({...enrollment,review_role:'regulator_reviewer'}).readOnly,true);
  assert.equal(enrollmentClassification({...enrollment,status:'qa_non_credit'}).kind,'qa');
  assert.equal(enrollmentClassification({...enrollment,enrollment_origin:'checkout',checkout_attempt_id:'paid'}).kind,'paid');
  assert.equal(enrollmentClassification({...enrollment,expires_at:'2000-01-01'}).status,'expired');
});
