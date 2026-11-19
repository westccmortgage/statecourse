import { NMLS_TRAINING_COURSE as identity } from './nmls-course-identity.mjs';
import { getNmlsReviewCourse } from '../netlify/functions/_lib/nmls-review-content.mjs';
import { getNmlsDraftFinalDefinition } from '../lib/nmls-final-authoring-content.mjs';

// Server/build-only definition; no answer keys or lesson bodies are in this projection.
// This must stay identical to the immutable row migration 025 stored in production:
// the delivery engine refuses to open unless both match exactly. The two approval
// fields are therefore pinned to the values recorded when version 2026.3 was
// defined. Provider approval is recorded in nmls-course-identity.mjs, not here;
// a manifest that carries approval identifiers needs a new course version and migration.
export function nmlsTrainingDefinition() {
 const course=getNmlsReviewCourse(identity.contentKey), final=getNmlsDraftFinalDefinition(identity.contentKey);
 if(course.digest!==identity.contentDigest || final.contentDigest!==course.digest) throw new Error('nmls_content_pin_mismatch');
 return {course_id:identity.id,course_version:identity.version,content_digest:course.digest,definition_digest:final.digest,
 manifest:{schema:'nmls-training-definition-v1',purpose:'free_training',sourceCourseKey:course.id,
  discipline:'mortgage',jurisdiction:'US',creditEligible:false,providerApprovalId:null,courseApprovalId:null,
  allocation:{federal:3,ethics:2,nontraditional:2,general:1},allocationStatus:'provisional_design_not_awarded_credit',
  modules:course.modules.map(m=>({id:m.id,title:m.title,units:m.units.map(u=>({id:u.id,title:u.title,requiredSeconds:u.requiredSeconds}))})),
  assessment:{questionCount:final.questionCount,bankCount:final.items.length,maxAutomaticAttempts:2,passCount:18,remediationRequired:true},
  sourceFiles:course.editorial.sourceRecords.map(s=>({path:s.path,sha256:s.sha256})),
  humanReviewed:false,validatedDuration:false}};
}
