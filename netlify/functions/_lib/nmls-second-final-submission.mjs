import { isDeepStrictEqual as same } from 'node:util';
import { createNmlsSecondFinalSubmissionEvaluator } from '../../../lib/nmls-second-final-submission.mjs';
import { makeNmlsSecondFinalDeliveryContext, validateNmlsSecondFinalDeliveryHistory,
  startNmlsSecondFinalDelivery } from '../../../lib/nmls-second-final-delivery.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';
import { validateNmlsSecondFinalDeliveryInput } from './nmls-second-final-delivery.mjs';

// PRIVATE040 composer, not an HTTP endpoint or CE completion. Commit actual039
// close + one terminal workflow seal together. Replay never grades or draws.
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const integer = v => Number.isSafeInteger(v) && v >= 0;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const fail = code => { throw new Error(`nmls_second_final_submission_${code}`); };
const policyCodes = new Set(['delivery_not_open', 'delivery_window_closed', 'rocs_document_unverified',
  'rocs_acknowledgment_required', 'rocs_already_accepted', 'rocs_presentation_required', 'rocs_accepted', 'rocs_required',
  'recovery_context_allowed', 'break_started', 'break_not_started', 'break_incomplete', 'break_completed', 'break_in_progress',
  'session_required', 'session_wall_limit', 'mandatory_break_required', 'rolling_study_limit', 'session_policy_allowed',
  'invalid_study_interval', 'overlapping_study_interval', 'study_interval_recorded']);
const observationCodes = new Set(['observation_unresolved', 'observation_ready', 'material_acknowledged', 'receipt_continuous',
  'outside_window_no_settlement', 'session_interrupted', 'material_revision_interrupted', 'receipt_missing_or_stale',
  'visibility_interrupted', 'horizon_expired', 'receipt_gap', 'settlement_rejected']);
const deliveryCodes = new Set([...policyCodes, ...observationCodes, 'inactivity_logout', 'observation_recovered',
  'recovery_review_required', 'final_logged_out', 'final_paused', 'final_session_opened', 'final_activity_checked']);
const submissionCodes = new Set(['second_final_policy_refused', 'second_final_session_required',
  'second_final_exposure_review_required', 'second_final_submission_allowed']);
const outcomeKeys = ['ok','code','status','submitted','firstFinalId','secondFinalId','sourceRevision','finalRevision',
  'workflowRevision','runtimeRevision','actorRevision','sessionId','submissionCode','deliveryCode','policyCode','observationCode',
  'result','workflowStatus','mode','deliveryAllowed','studentDeliveryEnabled','creditIssuanceAllowed','retakeEnabled'];
const resultKeys = ['mode', 'passed', 'correct', 'total', 'percent', 'requiredCorrect', 'assignedCreditSeconds',
  'creditIssuanceAllowed', 'courseCompletionIssued', 'disposition', 'remediation'];

export function validateNmlsSecondFinalSubmissionInput(input) {
  if (!plain(input) || input.kind !== 'submit_second_final' || !plain(input.answers) ||
      Object.keys(input.answers).length !== 25 || Object.entries(input.answers).some(([id, answer]) =>
        !/^N26-FIN-[FENG]\d{2}$/.test(id) || !['A','B','C','D'].includes(answer))) fail('invalid_request');
  const { answers, ...pause } = input;
  validateNmlsSecondFinalDeliveryInput({ ...pause, kind: 'pause' });
  return input;
}

function expectedOutcome(intent, proposal) {
  const { submission: s, closing: c } = proposal;
  return { ok: s.submitted, code: s.submitted ? 'private_second_final_submitted' : 'private_second_final_submission_refused',
    status: s.submitted ? 200 : c.outcome.status === 401 ? 401 : 409, submitted: s.submitted,
    firstFinalId: intent.firstFinalId, secondFinalId: intent.secondFinalId, sourceRevision: intent.expectedSourceRevision,
    finalRevision: 2, workflowRevision: intent.expectedWorkflowRevision + (s.submitted ? 1 : 0),
    runtimeRevision: c.runtime.revision, actorRevision: c.ledger.revision, sessionId: c.runtime.sessionId,
    submissionCode: s.code, deliveryCode: c.outcome.code, policyCode: c.outcome.policyCode,
    observationCode: c.outcome.observationCode, result: s.result,
    workflowStatus: s.submitted ? s.terminalStatus : 'second_issued',
    mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false,
    creditIssuanceAllowed: false, retakeEnabled: false };
}

function outcomeShape(o, i, definition) {
  if (!exact(o, outcomeKeys) || typeof o.submitted !== 'boolean' || o.ok !== o.submitted ||
      o.code !== (o.submitted ? 'private_second_final_submitted' : 'private_second_final_submission_refused') ||
      !(o.submitted ? o.status === 200 : [401,409].includes(o.status)) ||
      o.firstFinalId !== i.firstFinalId || o.secondFinalId !== i.secondFinalId || o.finalRevision !== 2 ||
      o.sourceRevision !== i.expectedSourceRevision || o.actorRevision !== i.expectedActorRevision + 1 ||
      o.runtimeRevision !== i.expectedRevision + 1 ||
      o.workflowRevision !== i.expectedWorkflowRevision + (o.submitted ? 1 : 0) ||
      o.sessionId !== null && !uuid(o.sessionId) ||
      !submissionCodes.has(o.submissionCode) || !policyCodes.has(o.policyCode) ||
      !observationCodes.has(o.observationCode) || !deliveryCodes.has(o.deliveryCode) ||
      o.submitted !== (o.submissionCode === 'second_final_submission_allowed') ||
      o.mode !== 'private_authoring_review' || o.deliveryAllowed !== false || o.studentDeliveryEnabled !== false ||
      o.creditIssuanceAllowed !== false || o.retakeEnabled !== false) fail('invalid_outcome');
  if (!o.submitted) {
    if (o.result !== null || o.workflowStatus !== 'second_issued') fail('invalid_outcome');
    return;
  }
  const r = o.result;
  if (o.deliveryCode !== 'final_paused' || o.policyCode !== 'session_policy_allowed' ||
      o.observationCode !== 'receipt_continuous' || o.sessionId !== i.sessionId ||
      !exact(r,resultKeys) || r.mode !== 'private_authoring_review' || !integer(r.correct) || r.correct > 25 ||
      r.total !== 25 || r.percent !== r.correct * 4 || r.requiredCorrect !== 18 || r.passed !== (r.correct >= 18) ||
      r.assignedCreditSeconds !== 0 || r.creditIssuanceAllowed !== false || r.courseCompletionIssued !== false ||
      r.disposition !== (r.passed ? 'draft_final_passed' : 'staff_review_required') ||
      o.workflowStatus !== (r.passed ? 'passed' : 'staff_review_required') || !Array.isArray(r.remediation)) fail('invalid_outcome');
  if (r.passed) { if (r.remediation.length) fail('invalid_outcome'); return; }
  const ids = r.remediation.map(x => x?.moduleId);
  if (!ids.length || new Set(ids).size !== ids.length ||
      !same(ids,definition.modules.filter(m=>ids.includes(m.id)).map(m=>m.id))) fail('invalid_outcome');
  for (const entry of r.remediation) {
    const m = definition.modules.find(m=>m.id===entry.moduleId);
    if (!same(entry, { moduleId: m.id, title: m.title,
      unitIds: definition.units.filter(u=>u.moduleId===m.id).map(u=>u.id),
      instruction: 'Revisit this module and its practice before another final review. This result does not verify remediation completion.' })) fail('invalid_outcome');
  }
}

function historyInput(c,actor,course,definition) {
  return { actorId:actor,sourceCourse:course,definition,review:c.attempt,binding:c.binding,firstFinal:c.reservedFinal,
    workflow:c.workflow,actorPolicy:c.actorPolicy,lease:c.lease,delivery:c.delivery,
    submissionEvent:c.genesisEvent,deliveryEvent:c.genesisDeliveryEvent,reservation:c.reservation,teachingEvent:c.teachingEvent,
    handoffOrigin:c.handoffOrigin,handoffOriginTeachingEvent:c.handoffOriginTeachingEvent,
    terminalChildEvent:c.terminalChildEvent,latestChildEvent:c.latestChildEvent,childBinding:c.childBinding,
    secondReservationEvent:c.secondReservationOrigin,secondReservationTeachingEvent:c.secondReservationOriginTeachingEvent };
}
export async function transactNmlsSecondFinalSubmission(input,studentId,{
  rpc,courseFor=getNmlsReviewCourse,definitionFor=getNmlsDraftFinalDefinition,
  evaluate=createNmlsSecondFinalSubmissionEvaluator(),clockRetries=1,
}={}) {
  validateNmlsSecondFinalSubmissionInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc,courseFor,definitionFor,evaluate].some(f=>typeof f!=='function') ||
      !integer(clockRetries) || clockRetries>1) fail('invalid_dependencies');
  const intent=structuredClone(input), commandDigest=digestNmlsCommand(intent);
  const { attemptId,firstFinalId,secondFinalId,expectedSourceRevision,expectedFinalRevision,expectedWorkflowRevision,...command }=intent;
  const { answers,...pauseIntent }=intent;
  const deliveryDigest=digestNmlsCommand({...pauseIntent,kind:'pause'});
  const args={p_student_id:studentId,p_attempt_id:attemptId,p_first_final_id:firstFinalId,p_second_final_id:secondFinalId,p_event_id:command.eventId};
  for(let retry=0;;retry++) {
    const c=structuredClone(await rpc('nmls_second_final_submission_context',structuredClone(args)));
    if(!plain(c)||c.attempt?.id!==attemptId||c.reservedFinal?.id!==firstFinalId||c.workflow?.second_id!==secondFinalId||
      ['secondDelivery','secondDeliveryEvent','secondSubmissionEvent'].some(k=>!Object.hasOwn(c,k)||c[k]!==null&&!plain(c[k]))) fail('context_scope');
    const course=structuredClone(courseFor(c.attempt.course_key)),definition=structuredClone(definitionFor(course.id));
    const {ledger,serverTimeMs:at}=validateNmlsPolicyContext(c,studentId,course);
    const history=historyInput(c,studentId,course,definition),{phase}=validateNmlsSecondFinalDeliveryHistory(history);
    const row=c.secondDelivery;
    if(row&&(row.second_id!==secondFinalId||row.first_final_id!==firstFinalId||row.student_id!==studentId||
      row.review_attempt_id!==attemptId||!same(row.phase_scope,phase)||!integer(row.revision)||row.revision<1||
      row.runtime?.revision!==row.revision||row.runtime.finalAttemptId!==secondFinalId||
      row.runtime.phaseDigest!==digestNmlsCommand(phase))) fail('sidecar_scope');
    const stale=c.secondSubmissionEvent!==null||c.secondDeliveryEvent!==null||
      c.attempt.revision!==expectedSourceRevision||c.reservedFinal.revision!==expectedFinalRevision||
      c.workflow.revision!==expectedWorkflowRevision||c.workflow.status!=='second_issued'||
      command.expectedRevision!==(row?.revision??0)||command.expectedActorRevision!==ledger.revision||
      command.sessionId!==(row?.runtime.sessionId??null);
    let proposal=null,transition={};
    if(!stale) {
      const final=makeNmlsSecondFinalDeliveryContext(history);
      const runtime=structuredClone(row?.runtime??startNmlsSecondFinalDelivery(final.finalPhase));
      const evidence={actorId:studentId,receivedAtMs:at};
      proposal=structuredClone(await evaluate({...final,sourceCourse:structuredClone(course),runtime:structuredClone(runtime),
        ledger:structuredClone(ledger),command:structuredClone(command),evidence:structuredClone(evidence)}));
      const expected=createNmlsSecondFinalSubmissionEvaluator()({...final,sourceCourse:course,runtime,ledger,command,evidence});
      if(!same(proposal,expected)) fail('invalid_transition');
      transition={phase,command:proposal.command,...proposal.closing,submission:proposal.submission};
    }
    const expectedFresh=proposal?structuredClone(expectedOutcome(intent,proposal)):null;
    let result;
    try {
      result=structuredClone(await rpc('nmls_second_final_submission_commit',{
        ...args,p_command_digest:commandDigest,p_expected_source_revision:expectedSourceRevision,p_expected_final_revision:expectedFinalRevision,
        p_expected_workflow_revision:expectedWorkflowRevision,p_expected_delivery_revision:command.expectedRevision,
        p_expected_actor_revision:command.expectedActorRevision,p_expected_session_id:command.sessionId,p_evaluated_at_ms:at,
        p_definition_digest:definition.digest,p_definition:structuredClone(definition),p_intent:structuredClone(intent),
        p_transition:structuredClone(transition),
      }));
    } catch(error) {
      if(retry<clockRetries&&/nmls_(?:second_final_submission|second_final_delivery|final_delivery|review)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    if(!exact(result,['duplicate','outcome'])||typeof result.duplicate!=='boolean') fail('invalid_commit_response');
    const o=result.outcome;
    outcomeShape(o,intent,definition);
    if(!result.duplicate) {
      if(!expectedFresh||!same(o,expectedFresh)) fail('invalid_commit_response');
    } else {
      const replay=c.secondSubmissionEvent?c:structuredClone(await rpc('nmls_second_final_submission_context',structuredClone(args)));
      validateNmlsPolicyContext(replay,studentId,course);
      if(!same(validateNmlsSecondFinalDeliveryHistory(historyInput(replay,studentId,course,definition)).phase,phase)) fail('invalid_commit_response');
      const e=replay?.secondSubmissionEvent,d=replay?.secondDeliveryEvent,w=replay?.workflow;
      const current=replay.secondDelivery;
      if(!plain(current)||current.second_id!==secondFinalId||current.first_final_id!==firstFinalId||current.student_id!==studentId||
        current.review_attempt_id!==attemptId||!same(current.phase_scope,phase)||!integer(current.revision)||current.revision<1||
        current.runtime?.revision!==current.revision||current.runtime.finalAttemptId!==secondFinalId||
        current.runtime.phaseDigest!==digestNmlsCommand(phase)||current.runtime.version!=='nmls-second-final-delivery-v1'||
        current.runtime.creditIssuanceAllowed!==false) fail('invalid_commit_response');
      const payload={submitted:o.submitted,code:o.submissionCode,answers:o.submitted?intent.answers:null,
        result:o.result,terminalStatus:o.submitted?o.workflowStatus:null};
      if(!plain(e)||!plain(d)||!plain(w)||e.student_id!==studentId||e.event_id!==command.eventId||
        e.first_final_id!==firstFinalId||e.second_id!==secondFinalId||e.review_attempt_id!==attemptId||
        e.reservation_event_id!==c.secondReservationOrigin.event_id||e.command_digest!==commandDigest||
        e.delivery_command_digest!==deliveryDigest||e.definition_digest!==definition.digest||
        e.source_revision!==expectedSourceRevision||e.final_revision!==2||e.workflow_before_revision!==expectedWorkflowRevision||
        e.workflow_revision!==o.workflowRevision||e.delivery_revision!==o.runtimeRevision||e.actor_revision!==o.actorRevision||
        e.session_id!==o.sessionId||e.submitted!==o.submitted||e.submission_payload_digest!==digestNmlsCommand(payload)||
        !same(e.outcome,o)||!integer(e.transaction_id)||e.transaction_id<1||d.transaction_id!==e.transaction_id||
        d.student_id!==studentId||d.event_id!==command.eventId||d.first_final_id!==firstFinalId||d.second_id!==secondFinalId||
        d.review_attempt_id!==attemptId||d.reservation_event_id!==e.reservation_event_id||d.command_digest!==deliveryDigest||
        d.definition_digest!==definition.digest||d.source_revision!==expectedSourceRevision||d.final_revision!==2||
        d.workflow_revision!==expectedWorkflowRevision||d.delivery_revision!==o.runtimeRevision||d.actor_revision!==o.actorRevision||
        d.audit?.kind!=='pause'||d.audit?.eventId!==command.eventId||!same(d.audit?.phase,phase)||
        d.runtime?.revision!==o.runtimeRevision||d.runtime?.sessionId!==o.sessionId||
        d.runtime?.phaseDigest!==digestNmlsCommand(phase)||d.runtime?.creditIssuanceAllowed!==false||
        d.outcome?.code!==o.deliveryCode||d.outcome?.policyCode!==o.policyCode||d.outcome?.observationCode!==o.observationCode||
        d.outcome?.actorRevision!==o.actorRevision||d.outcome?.revision!==o.runtimeRevision||
        d.outcome?.runtimeStatus!==d.runtime.status||d.outcome?.candidateMaterialAllowed!==false||
        d.outcome?.candidateUntilMs!==null||d.outcome?.candidateWindow!==null||d.outcome?.deliveryAllowed!==false||
        d.runtime.lastReceiptMs>replay.serverTimeMs||d.runtime.lastReceiptMs>replay.actorPolicy?.ledger?.lastReceiptMs||
        w.revision<o.workflowRevision||o.submitted&&(!same(w.second_answers,intent.answers)||!same(w.second_result,o.result)||
          w.status!==o.workflowStatus)) fail('invalid_commit_response');
      const {answers: unusedAnswers,...pauseCommand}=command;
      const childLease={student_id:studentId,attempt_id:attemptId,phase_kind:'remediation',phase_owner_id:firstFinalId,
        phase_active:false,session_id:history.workflow.runtime.sessionId};
      const finalLease=r=>({student_id:studentId,attempt_id:attemptId,phase_kind:'second_final',phase_owner_id:secondFinalId,
        phase_active:r.status==='active',session_id:r.sessionId});
      const before=d.runtime_before;
      if(!plain(before)||before.revision!==command.expectedRevision||before.sessionId!==command.sessionId||
        before.version!=='nmls-second-final-delivery-v1'||before.finalAttemptId!==secondFinalId||before.phaseDigest!==digestNmlsCommand(phase)||
        !same(d.command,{...pauseCommand,kind:'pause'})||d.audit.atMs!==d.runtime.lastReceiptMs||
        d.audit.policy?.kind!=='check_access'||d.audit.policy?.actorId!==studentId||
        d.audit.policy?.atMs!==d.runtime.lastReceiptMs||d.audit.policy?.offeringId!==phase.offeringId||
        d.audit.policy?.contentDigest!==phase.contentDigest||d.audit.policy?.policyId!==c.binding.policy_id||
        d.audit.policy?.code!==o.policyCode||
        d.audit.runtimeBeforeRevision!==command.expectedRevision||d.runtime.revision>current.revision||
        !same(d.lease_before,before.sessionId===null?childLease:finalLease(before))||
        !same(d.lease_after,d.runtime.sessionId===null?d.lease_before:finalLease(d.runtime))||
        [e.recorded_at,d.recorded_at].some(v=>typeof v!=='string'||!Number.isFinite(Date.parse(v))||
          Math.abs(Date.parse(v)-d.runtime.lastReceiptMs)>1000)) fail('invalid_commit_response');
    }
    return {status:o.status,body:{...structuredClone(o),duplicate:result.duplicate}};
  }
}
