import { rpc } from './db.mjs';
import { NMLS_TRAINING_COURSE as identity, isNmlsTrainingCourse } from '../../../config/nmls-course-identity.mjs';
import { nmlsTrainingDefinition } from '../../../config/nmls-training-definition.mjs';
import { executeNmlsTraining } from './nmls-training-service.mjs';

const remaining = {
  not_started:'Start the first training lesson.', source:'Complete the remaining lessons and practice checks.',
  first_assessment:'Complete the first practice assessment.', remediation_required:'Complete the assigned targeted practice before a second assessment.',
  remediation:'Complete the assigned targeted practice.', second_assessment:'Complete the second practice assessment.',
  passed:'Training practice passed. No NMLS CE credit or certificate is awarded.',
  staff_review_required:'Contact course support before any further assessment attempt.',
};

// Read through the real student access/history validator, then discard all
// lesson bodies, question selections, answers, feedback and raw runtime state.
// A missing runtime is reported as unavailable, never as zero progress.
export async function withNmlsTrainingSummary(studentId,row,{callRpc=rpc}={}) {
  if(!isNmlsTrainingCourse(row.course_id))return row;
  const base={...row,discipline:identity.discipline,course_name:identity.title,
    completed_at:null,compliance_credit_eligible:false,regulatory_credit_status:'not_applicable',
    certificate_status:'not_applicable',portal_certificate_status:'not_applicable',certificate_id:null,certificate_number:null,certificate_issued_at:null,
    earliest_final_exam_at:null,portal_final_exam_eligible:false,final_exam_status:'not_applicable',
    payment_status:'not_applicable',payment_amount:null,payment_currency:null,training_completed:false};
  try {
    if(row.enrollment_origin!=='training'||row.course_version!==identity.version||row.state!==identity.state)throw new Error('identity_mismatch');
    let context;
    const result=await executeNmlsTraining({operation:'snapshot',command:{enrollmentId:row.enrollment_id}},studentId,{
      rpc:async(name,args)=>{if(name!=='nmls_training_context')throw new Error('read_only_required');context=await callRpc(name,args);return context;},
    });
    if(result.status!==200||!context)throw new Error('training_unavailable');
    const definition=nmlsTrainingDefinition(),phase=result.body.phase;
    const totalUnits=definition.manifest.modules.reduce((sum,module)=>sum+module.units.length,0),totalModules=definition.manifest.modules.length;
    if(context.reviewRole==='regulator_reviewer') {
      if(result.body.readOnly!==true||phase!=='read_only_review')throw new Error('review_mode_mismatch');
      const notice='Read-only regulator review. Learning progress, NMLS credit and certificates are not recorded.';
      return {...base,review_role:'regulator_reviewer',resume_path:`${identity.studentRoute}?enrollment_id=${encodeURIComponent(row.enrollment_id)}`,
        assignment_count:totalUnits,assignments_completed:null,progress_percent:null,quiz_mastery_percent:null,
        training_phase:phase,remaining_requirements:[notice],
        nmls_training:{available:true,readOnly:true,accessMode:'regulator_reviewer',phase,completedUnits:null,totalUnits,passedModules:null,totalModules,
          practicePassed:false,remainingRequirements:[notice],creditEarned:false}};
    }
    if(result.body.readOnly===true)throw new Error('review_mode_mismatch');
    const completedUnits=context.runtime?.source.completedUnitIds.length||0,passedModules=context.runtime?.source.passedModuleIds.length||0;
    const practicePassed=phase==='passed';
    return {...base,resume_path:`${identity.studentRoute}?enrollment_id=${encodeURIComponent(row.enrollment_id)}`,
      assignment_count:totalUnits,assignments_completed:completedUnits,
      progress_percent:practicePassed?100:Math.floor(completedUnits/(totalUnits+1)*100),
      training_phase:phase,training_completed:practicePassed,quiz_mastery_percent:null,
      remaining_requirements:[remaining[phase]],
      nmls_training:{available:true,phase,completedUnits,totalUnits,passedModules,totalModules,practicePassed,remainingRequirements:[remaining[phase]],creditEarned:false}};
  } catch {
    return {...base,resume_path:null,assignment_count:null,assignments_completed:null,progress_percent:null,quiz_mastery_percent:null,
      training_phase:'unavailable',remaining_requirements:['Training access and saved progress could not be verified.'],
      nmls_training:{available:false,phase:'unavailable',completedUnits:null,totalUnits:null,practicePassed:false,creditEarned:false}};
  }
}
