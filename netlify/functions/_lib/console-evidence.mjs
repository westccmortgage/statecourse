import { getCourse } from '../../../config/course-catalog.mjs';
import { randomUUID } from 'node:crypto';
import { dbRequest, rpc } from './db.mjs';
import { courseFor, fail, globalOwner, UUID } from './console-operations.mjs';
import { reviewFingerprint } from './console-review-fingerprint.mjs';

const keys={regulatory:['provider','course','school','instructor','human_review','duration_validation','rocs','reporting_acceptance'],commerce:['checkout','webhook','refund_replay']};
export function validateEvidence(input,course,actor) {
  if(input.courseVersion!==course.current_version)fail('course_version_changed',409);
  if(!['regulatory','commerce','media'].includes(input.area))fail('invalid_evidence_area');
  if(input.area==='media'?!/^(requirements|[a-z0-9-]+:playback)$/.test(input.key||''):!keys[input.area].includes(input.key))fail('invalid_evidence_key');
  if(!['verified','missing','rejected','not_applicable'].includes(input.status))fail('invalid_evidence_status');
  const note=String(input.note||'').trim(),reference=String(input.reference||'').trim();
  if(note.length<10||note.length>5000||reference.length>2000)fail('evidence_note_required');
  if(['verified','not_applicable'].includes(input.status)&&!/^https:\/\//.test(reference))fail('evidence_document_reference_required');
  const date=value=>{if(!value)return null;const ms=Date.parse(value);if(!Number.isFinite(ms))fail('invalid_evidence_date');return new Date(ms).toISOString();};
  const effective=date(input.effectiveAt),expiry=date(input.expiresAt);
  if(expiry&&effective&&expiry<=effective)fail('invalid_evidence_interval');
  const metadata={};
  if(input.area==='commerce'&&input.status==='verified'){const price=getCourse(course.id)?.price?.test;if(!price)fail('test_price_required_before_acceptance');metadata.testPriceCents=price;}
  if(input.area==='regulatory'&&input.status==='verified'&&['provider','course'].includes(input.key)&&(!String(input.authority||'').trim()||!String(input.approvalNumber||'').trim()))fail('approval_authority_and_number_required');
  if(input.area==='media'&&input.status==='verified') {
    if(input.key==='requirements'){const n=Number(input.requiredCount);if(!Number.isSafeInteger(n)||n<0||n>10000)fail('required_media_count_required');metadata.requiredCount=n;}
    else {if(!/^[a-f0-9]{32}$/i.test(input.streamUid||''))fail('verified_stream_uid_required');metadata.streamUid=input.streamUid;}
  }
  if(input.status==='not_applicable'&&!['school','instructor'].includes(input.key))fail('gate_cannot_be_waived');
  return {course_id:course.id,course_version:course.current_version,area:input.area,evidence_key:input.key,status:input.status,
    reference,note,authority:String(input.authority||'').slice(0,200),approval_number:String(input.approvalNumber||'').slice(0,200),
    effective_at:effective,expires_at:expiry,metadata,recorded_by:actor};
}
export async function recordEvidence(staff,input) {
  if(!globalOwner(staff))fail('unscoped_owner_required',403);
  const course=await courseFor(staff,input.courseId);
  return dbRequest('console_evidence_events',{method:'POST',prefer:'return=representation',body:validateEvidence(input,course,staff.auth.student.id)});
}
export async function reviewAccess(staff,input) {
  if(!globalOwner(staff))fail('unscoped_owner_required',403);
  const course=await courseFor(staff,input.courseId);
  if(input.operation==='create'&&input.courseVersion!==course.current_version)fail('course_version_changed',409);
  if(!UUID.test(input.studentId||'')||!['create','expiry','revoke'].includes(input.operation))fail('invalid_review_scope');
  if(input.operation!=='create'&&!UUID.test(input.enrollmentId||''))fail('invalid_review_enrollment');
  if(String(input.note||'').trim().length<10)fail('review_reason_required');
  return rpc('console_review_access',{p_actor:staff.auth.student.id,p_student:input.studentId,p_course:course.id,p_version:input.courseVersion,
    p_role:input.role||null,p_expires:input.expiresAt||null,p_action:input.operation,p_enrollment:input.enrollmentId||null});
}
export async function recordFinding(staff,input) {
  if(!globalOwner(staff))fail('unscoped_owner_required',403);
  const course=await courseFor(staff,input.courseId);
  if(input.courseVersion!==course.current_version)fail('course_version_changed',409);
  if(!UUID.test(input.enrollmentId||''))fail('review_enrollment_required');
  const e=(await dbRequest(`enrollments?id=eq.${input.enrollmentId}&select=id,course_id,course_version,review_role,status,expires_at,compliance_credit_eligible,console_content_release_id&limit=1`))?.[0];
  if(!e?.review_role||e.course_id!==course.id||e.course_version!==input.courseVersion||e.compliance_credit_eligible)fail('review_scope_mismatch',403);
  if(!['open','resolved','reopened','signed_off'].includes(input.status))fail('invalid_finding_status');
  let releaseHash=null;
  if(e.console_content_release_id){const release=(await dbRequest(`console_course_releases?id=eq.${e.console_content_release_id}&course_id=eq.${course.id}&select=content_hash&limit=1`))?.[0];if(!release)fail('review_release_unavailable',409);releaseHash=release.content_hash;}
  const hash=reviewFingerprint(course.id,releaseHash);
  if(input.contentHash!==hash)fail('review_content_changed',409);
  if(String(input.note||'').trim().length<10||String(input.note).length>5000)fail('finding_note_required');
  if(!/^https:\/\//.test(input.reference||''))fail('review_document_reference_required');
  const findingKey=input.findingKey||randomUUID();if(!UUID.test(findingKey))fail('invalid_finding_key');
  if(input.status!=='open') {
    const previous=await dbRequest(`console_review_findings?course_id=eq.${course.id}&course_version=eq.${encodeURIComponent(input.courseVersion)}&finding_key=eq.${findingKey}&order=event_order.desc&limit=1`);
    if(!previous?.length||previous[0].enrollment_id!==e.id||previous[0].content_hash!==hash)fail('finding_scope_changed',409);
    if(input.status==='signed_off'&&(previous[0].status!=='resolved'||!['active','qa_non_credit'].includes(e.status)||Date.parse(e.expires_at)<=Date.now()))fail('resolved_active_review_required',409);
  }
  return rpc('console_record_review_finding',{p_course:course.id,p_version:input.courseVersion,p_enrollment:e.id,
    p_key:findingKey,p_hash:hash,p_status:input.status,p_note:input.note,p_reference:input.reference,p_actor:staff.auth.student.id});
}
