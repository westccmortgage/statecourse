import { completeSource } from './console-readiness.mjs';
import { enrollmentClassification } from './console-learning.mjs';
import { isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';

// Read-only projections of existing state services. These never call issue/report RPCs.
export function completionReadiness(enrollment, course, learning, sources) {
 const nonCredit=enrollmentClassification(enrollment).nonCredit||isNmlsTrainingCourse(enrollment.course_id);
 const events=completeSource(sources.events)?sources.events.rows.filter(e=>e.enrollment_id===enrollment.id):null;
 const complete=events?.some(e=>e.completion_status==='complete');
 const certificates=completeSource(sources.certificates)?sources.certificates.rows.filter(e=>e.enrollment_id===enrollment.id):null;
 const reports=completeSource(sources.reports)?sources.reports.rows:null;
 let creditEligible=nonCredit?false:null,certificateEligible=nonCredit?false:null;
 let blocker=nonCredit?'Training / QA / reviewer access cannot earn regulatory credit.':'State-specific completion verification required.';
 let source='course_completion_events / state certificate and reporting records';
 if(!nonCredit&&enrollment.state==='CA') {
  const approval=Boolean(course?.regulatory_approval_number?.trim());
  certificateEligible=events===null?null:Boolean(approval&&complete);
  creditEligible=complete===false?false:null;
  blocker=!approval?'No DRE approval number recorded.':!complete?'No final regulatory completion event.':'Recorded California certificate prerequisites met; issuing service must recheck at issuance.';
  source+='; issue_california_completion_certificate prerequisites (read-only projection)';
 }
 if(!nonCredit&&enrollment.state==='MI') {
  const gate=sources.michiganStatus;
  certificateEligible=typeof gate?.certificate_eligible==='boolean'?gate.certificate_eligible:null;
  creditEligible=typeof gate?.completion_eligible==='boolean'?gate.completion_eligible:null;
  blocker=gate?`Michigan operational status: ${(gate.blockers||[]).map(b=>typeof b==='string'?b:b.code||'Operational gate').join('; ')||'See separately enforced issuance/reporting gates'}`:'Michigan operational status unavailable.';
  source+='; michigan_operational_status';
 }
 return {training:learning.trainingCompleted??null,regulatory:events?.map(e=>e.completion_status)??null,
  creditEligible,certificateEligible,certificates,reports,reportingRequirement:isNmlsTrainingCourse(enrollment.course_id)?'Closed NMLS safety gate':enrollment.state==='MO'?'Missouri completion/time reports; school-period records, not individual submission proof':enrollment.state==='MI'?'Michigan versioned individual completion report':'Jurisdiction-specific reporting; requirement not inferred',
  reportingScope:enrollment.state==='MI'?'enrollment':'school-period',blocker,source};
}
