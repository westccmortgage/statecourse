import { nmlsAdministrativeProgress } from './nmls-training-service.mjs';
import { isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';

export function enrollmentClassification(enrollment, now = Date.now()) {
  const reviewer = ['regulator_reviewer', 'student_reviewer'].includes(enrollment.review_role);
  const kind = reviewer ? enrollment.review_role : enrollment.status === 'qa_non_credit' ? 'qa'
    : enrollment.enrollment_origin === 'training' ? 'training' : enrollment.checkout_attempt_id ? 'paid' : 'unverified';
  return { kind, reviewer, nonCredit: reviewer || ['training', 'qa'].includes(kind),
    status: ['cancelled','withdrawn'].includes(enrollment.status)?'withdrawn': enrollment.expires_at && Date.parse(enrollment.expires_at) <= now ? 'expired' : enrollment.status,
    readOnly: enrollment.review_role === 'regulator_reviewer' };
}

export async function readNmlsLearning(enrollment, readRows) {
  const source = await readRows(`nmls_training_attempts?enrollment_id=eq.${enrollment.id}&select=enrollment_id,student_id,course_id,course_version,revision,runtime,updated_at&limit=2`);
  if (!source.available || source.truncated || source.rows.length !== 1)
    return { adapter: 'nmls_training', available: false, reason: 'NMLS training attempt missing, ambiguous or unreadable.', creditEligible: false, certificateEligible: false };
  try { return nmlsAdministrativeProgress(source.rows[0], enrollment); }
  catch { return { adapter: 'nmls_training', available: false, reason: 'NMLS enrollment identity, pinned version or runtime history does not validate.', creditEligible: false, certificateEligible: false }; }
}

export function realEstateLearning(enrollment, structure, blocks, assignments, assessments, finals) {
  const required = structure.units.flatMap(u => u.blocks.filter(b => b.required !== false).map(b => `${u.id}:${b.id}`));
  const mastered = new Set(blocks.rows.filter(b => b.status === 'MASTERED').map(b => `${b.assignment_id}:${b.block_id}`));
  const versionMatched = structure.rules?.version === enrollment.course_version;
  const available = structure.available && blocks.available && !blocks.truncated && versionMatched && required.length > 0;
  return { adapter: enrollment.state === 'CA' ? 'california_blocks' : enrollment.state === 'TX' ? 'texas_training' : 'unconnected_real_estate',
    available, completed: available ? required.filter(id => mastered.has(id)).length : null, total: available ? required.length : null,
    unit: 'required blocks', courseVersion: enrollment.course_version,
    reason: !structure.available ? 'Student runtime is not registered.' : !versionMatched ? 'Enrollment version differs from registered learning rules.' : !available ? 'Progress source is unavailable or incomplete.' : null,
    modules: assignments.rows.map(a => ({ id: a.assignment_id, status: a.status, activeSeconds: a.active_seconds ?? null,remediation:a.remediation_status??null })),
    assessments: assessments?.available && !assessments.truncated ? assessments.rows : null,
    finalAssessments: finals?.available&&!finals.truncated?finals.rows:null,
    remediation: { status: assignments.available&&!assignments.truncated ? assignments.rows.some(a=>['required','content_viewed'].includes(a.remediation_status))?'required':'See recorded block/assignment remediation attempts' : 'unverified' },
    trainingCompleted: enrollment.completed_at ? true : available&&assignments.available&&!assignments.truncated ? structure.units.every(u=>assignments.rows.some(a=>a.assignment_id===u.id&&a.status==='completed')) : null,
    creditEligible: enrollmentClassification(enrollment).nonCredit ? false : null,
    enrollmentCreditFlag: enrollment.compliance_credit_eligible??null,
    certificateEligible: enrollmentClassification(enrollment).nonCredit ? false : null,
    source: 'lms_block_progress / lms_assignment_state / lms_block_assessment_attempts',
  };
}

export function disciplineForEnrollment(enrollment) {
  return isNmlsTrainingCourse(enrollment.course_id) ? 'mortgage' : 'real-estate';
}
