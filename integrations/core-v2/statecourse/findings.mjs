import { canonical, digest, freeze, IntegrationError } from './contract.mjs';
const KEYS = {
 enrollments:['id'], courses:['id'], regulatory_course_versions:['course_id','version'], access_grants:['id'],
 lms_compliance_state:['enrollment_id'], lms_assignment_state:['enrollment_id','assignment_id','assignment_version'],
 lms_block_progress:['enrollment_id','assignment_id','block_id'], payment_enrollments:['payment_id','course_id'], payments:['id'],
 console_course_releases:['id'], console_course_reviews:['id'], console_tasks:['id'], console_task_events:['id'],
 console_evidence_events:['id'], console_review_findings:['id'],
};
export function verifySnapshot(snapshot) {
 const { snapshotHash, ...body } = snapshot;
 if (snapshotHash !== digest(body)) throw new IntegrationError('snapshot_integrity_failed', 422);
}
export function candidatesFrom(snapshot) {
 verifySnapshot(snapshot);
 const t=snapshot.tables, e=t.enrollments[0], out=[];
 const ref=(table,row,field)=>({ table, key:Object.fromEntries(KEYS[table].map(k=>[k,row[k]])), field,
   value:row[field], recordHash:digest(row), snapshotHash:snapshot.snapshotHash });
 // Absence is evidenced by the exact complete, bounded query result and scope, not an invented row.
 const absent=table=>({ table, key:null, field:null, value:null, resultHash:digest(t[table]),
   rowCount:t[table].length, scope:snapshot.scope, snapshotHash:snapshot.snapshotHash });
 const add=(code,explanation,evidence)=>out.push({ code, explanation, evidence,
   candidateId:digest({code,evidence}).slice(0,32) });
 const enrollment=(field)=>ref('enrollments',e,field);
 if (!t.regulatory_course_versions.length) add('pinned_version_missing','The enrollment has no matching regulatory course version in this snapshot.',[enrollment('course_version'),absent('regulatory_course_versions')]);
 if (e.enrollment_origin!=='purchase' && e.compliance_credit_eligible===true) add('nonpurchase_credit_flag','A training or review enrollment carries the regulatory credit eligibility flag.',[enrollment('enrollment_origin'),enrollment('compliance_credit_eligible')]);
 if (['active','qa_non_credit'].includes(e.status) && !t.access_grants.some(g=>g.status==='active')) add('active_access_missing','The active enrollment has no active access grant in this snapshot.',[enrollment('status'),...t.access_grants.map(g=>ref('access_grants',g,'status')),absent('access_grants')]);
 // Package components use payment_enrollments. The legacy primary id is only a fallback.
 if (e.enrollment_origin==='purchase' && !t.payments.length) add('purchase_payment_missing','The purchase enrollment has no linked payment, including package allocations, in this snapshot.',[enrollment('enrollment_origin'),absent('payment_enrollments'),absent('payments')]);
 const version=t.regulatory_course_versions[0];
 if (version && e.compliance_credit_eligible===true && (version.lifecycle_status!=='approved' || version.regulatory_credit_enabled!==true)) add('credit_configuration_conflict','Enrollment credit eligibility conflicts with its pinned version configuration. This observation does not award or revoke credit.',[enrollment('compliance_credit_eligible'),ref('regulatory_course_versions',version,'lifecycle_status'),ref('regulatory_course_versions',version,'regulatory_credit_enabled')]);
 for (const table of ['lms_assignment_state','lms_block_progress']) for(const row of t[table]) {
  if(row.course_version!==e.course_version) add('progress_version_mismatch','A progress record names a different course version from the enrollment.',[enrollment('course_version'),ref(table,row,'course_version')]);
 }
 const release=t.console_course_releases[0];
 if (e.console_content_release_id && !release) add('pinned_release_missing','The enrollment content release is absent from this snapshot.',[enrollment('console_content_release_id'),absent('console_course_releases')]);
 if(release) {
  const reviews=t.console_course_reviews.filter(x=>x.content_hash===release.content_hash);
  const latest=reviews.at(-1);
  if(!latest || latest.outcome!=='pass') add('release_review_not_passed','The latest recorded review for the pinned release hash is not a pass, or no review is recorded. This does not recompute the original payload hash.',[ref('console_course_releases',release,'content_hash'),...(latest?[ref('console_course_reviews',latest,'outcome')]:[absent('console_course_reviews')])]);
 }
 for(const task of t.console_tasks.filter(x=>x.priority==='blocking' && x.status!=='closed')) add('existing_blocking_task','An existing Admin Console blocking task remains open.',[ref('console_tasks',task,'priority'),ref('console_tasks',task,'status')]);
 const evidenceByKey=new Map();
 for(const row of t.console_evidence_events) evidenceByKey.set(`${row.area}/${row.evidence_key}`,row);
 for(const row of evidenceByKey.values()) {
  if(['missing','rejected'].includes(row.status)) add('existing_evidence_gap','The latest existing evidence record is marked missing or rejected. This observation does not determine regulatory sufficiency.',[ref('console_evidence_events',row,'evidence_key'),ref('console_evidence_events',row,'status')]);
  else if(row.status==='verified' && row.expires_at && Date.parse(row.expires_at)<=Date.parse(snapshot.capturedAt)) add('existing_evidence_expired','An existing verified evidence record has expired by the snapshot capture time.',[ref('console_evidence_events',row,'status'),ref('console_evidence_events',row,'expires_at')]);
 }
 const latest=new Map();
 for(const row of t.console_review_findings) if(row.course_version===e.course_version) latest.set(row.finding_key,row);
 for(const row of latest.values()) if(['open','reopened'].includes(row.status)) add('existing_review_finding','An existing reviewer finding remains open or reopened for this enrollment and version.',[ref('console_review_findings',row,'status'),ref('console_review_findings',row,'content_hash')]);
 if(out.length>32) throw new IntegrationError('finding_limit_exceeded',422);
 return freeze(out.map(x=>({...x, material:canonical({rule:x.code,explanation:x.explanation,evidence:x.evidence})})));
}
