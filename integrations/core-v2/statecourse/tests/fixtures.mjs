import { digest, COURSE_ID, VERSION, freeze } from '../contract.mjs';
import { QUERIES } from '../adapter.mjs';
export const ACTOR='11111111-1111-4111-8111-111111111111';
export const SESSION='22222222-2222-4222-8222-222222222222';
export const ENROLLMENT='33333333-3333-4333-8333-333333333333';
export const OTHER='44444444-4444-4444-8444-444444444444';
export const ORGANIZATION='55555555-5555-4555-8555-555555555555';
export const PROOF='a'.repeat(43);
export const IDENTITY={userId:ACTOR,sessionId:SESSION,proofHash:digest(PROOF)};
export function snapshot(change=()=>{}) {
 const tables=Object.fromEntries(Object.keys(QUERIES).map(t=>[t,[]]));
 tables.enrollments=[{id:ENROLLMENT,course_id:COURSE_ID,state:'CA',status:'active',course_version:'1.0',enrollment_origin:'training',review_role:null,compliance_credit_eligible:false,console_content_release_id:null}];
 tables.courses=[{id:COURSE_ID,state:'CA',current_version:'2.0',approval_status:'submission_draft',regulatory_approval_number:null}];
 tables.regulatory_course_versions=[{course_id:COURSE_ID,version:'1.0',lifecycle_status:'development',regulatory_credit_enabled:false}];
 tables.access_grants=[{id:OTHER,enrollment_id:ENROLLMENT,course_id:COURSE_ID,status:'active'}];
 change(tables);
 const body={contractVersion:VERSION,scope:{courseId:COURSE_ID,enrollmentId:ENROLLMENT},capturedAt:'2026-10-19T12:00:00Z',tables};
 return freeze({...body,snapshotHash:digest(body)});
}
