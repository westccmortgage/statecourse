import { isDeepStrictEqual as same } from 'node:util';
import { createNmlsFirstFinalSubmissionEvaluator } from '../../../lib/nmls-first-final-submission.mjs';
import { startNmlsFirstFinalDelivery } from '../../../lib/nmls-final-delivery.mjs';
import { makeNmlsFirstFinalDeliveryContext, nmlsFinalDeliveryScope } from '../../../lib/nmls-final-delivery-context.mjs';
import { requireNmlsFinalReviewCompletion } from '../../../lib/nmls-final-assessment.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';
import { validateNmlsFirstFinalDeliveryInput } from './nmls-first-final-delivery.mjs';

// PRIVATE SERVER ADAPTER ONLY. No HTTP handler imports this module.036 must
// commit the genuine035 closing transition, sealed026 result and optional
// empty028 child together. The result is disclosed only AFTER that commit.
// No child activation, second final, identity, attendance or CE credit is added.
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const sha = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const integer = v => Number.isSafeInteger(v) && v >= 0;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const fail = code => { throw new Error(`nmls_first_final_submission_${code}`); };
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
const submissionCodes = new Set(['first_final_policy_refused', 'first_final_session_required',
  'first_final_exposure_review_required', 'first_final_submission_allowed']);
const outcomeKeys = ['ok', 'code', 'status', 'submitted', 'finalAttemptId', 'finalRevision', 'sourceRevision',
  'actorRevision', 'deliveryRevision', 'submissionCode', 'deliveryCode', 'policyCode', 'observationCode', 'result',
  'remediation', 'workflowRevision', 'mode', 'deliveryAllowed', 'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled'];
const resultKeys = ['mode', 'passed', 'correct', 'total', 'percent', 'requiredCorrect', 'assignedCreditSeconds',
  'creditIssuanceAllowed', 'courseCompletionIssued', 'disposition', 'remediation'];
const manifestKeys = ['courseKey', 'contentDigest', 'sourceCourseKey', 'sourceContentDigest', 'definitionDigest',
  'finalAttemptId', 'reviewAttemptId', 'moduleIds', 'unitIds', 'completed', 'retakeEnabled'];

export function validateNmlsFirstFinalSubmissionInput(input) {
  if (!plain(input) || input.kind !== 'submit_first_final' || !plain(input.answers) ||
      Object.keys(input.answers).length !== 25 || Object.entries(input.answers).some(([id, answer]) =>
        !/^N26-FIN-[FENG]\d{2}$/.test(id) || !['A', 'B', 'C', 'D'].includes(answer))) fail('invalid_request');
  const { answers, ...pause } = input;
  validateNmlsFirstFinalDeliveryInput({ ...pause, kind: 'pause' });
  return input;
}

function expectedOutcome(intent, proposal) {
  const { submission: s, closing: c } = proposal;
  return { ok: s.submitted, code: s.submitted ? 'private_first_final_submitted' : 'private_first_final_submission_refused',
    status: s.submitted ? 200 : c.outcome.status === 401 ? 401 : 409, submitted: s.submitted,
    finalAttemptId: intent.finalAttemptId, finalRevision: s.submitted ? 2 : 1,
    sourceRevision: intent.expectedSourceRevision, actorRevision: c.ledger.revision, deliveryRevision: c.runtime.revision,
    submissionCode: s.code, deliveryCode: c.outcome.code, policyCode: c.outcome.policyCode, observationCode: c.outcome.observationCode,
    result: s.result, remediation: s.manifest, workflowRevision: s.submitted && !s.result.passed ? 1 : null,
    mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false,
    creditIssuanceAllowed: false, retakeEnabled: false };
}

function outcomeShape(o, intent, definition) {
  if (!exact(o, outcomeKeys) || typeof o.submitted !== 'boolean' || o.ok !== o.submitted ||
      o.code !== (o.submitted ? 'private_first_final_submitted' : 'private_first_final_submission_refused') ||
      !(o.submitted ? o.status === 200 : [401, 409].includes(o.status)) ||
      o.finalAttemptId !== intent.finalAttemptId || o.finalRevision !== (o.submitted ? 2 : 1) ||
      o.sourceRevision !== intent.expectedSourceRevision || o.actorRevision !== intent.expectedActorRevision + 1 ||
      o.deliveryRevision !== intent.expectedRevision + 1 || !integer(o.actorRevision) || !integer(o.deliveryRevision) ||
      !submissionCodes.has(o.submissionCode) || !policyCodes.has(o.policyCode) || !observationCodes.has(o.observationCode) ||
      !deliveryCodes.has(o.deliveryCode) || o.submitted !== (o.submissionCode === 'first_final_submission_allowed') ||
      o.mode !== 'private_authoring_review' || o.deliveryAllowed !== false || o.studentDeliveryEnabled !== false ||
      o.creditIssuanceAllowed !== false || o.retakeEnabled !== false) fail('invalid_outcome');
  if (!o.submitted) {
    if (o.result !== null || o.remediation !== null || o.workflowRevision !== null) fail('invalid_outcome');
    return;
  }
  if (o.deliveryCode !== 'final_paused' || o.policyCode !== 'session_policy_allowed' ||
      o.observationCode !== 'receipt_continuous') fail('invalid_outcome');
  const r = o.result;
  if (!exact(r, resultKeys) || r.mode !== 'private_authoring_review' || !integer(r.correct) || r.correct > 25 ||
      r.total !== 25 || r.percent !== r.correct * 4 || r.requiredCorrect !== 18 || r.passed !== (r.correct >= 18) ||
      r.assignedCreditSeconds !== 0 || r.creditIssuanceAllowed !== false || r.courseCompletionIssued !== false ||
      r.disposition !== (r.passed ? 'draft_final_passed' : 'remediation_required') || !Array.isArray(r.remediation)) fail('invalid_outcome');
  if (r.passed) {
    if (r.remediation.length || o.remediation !== null || o.workflowRevision !== null) fail('invalid_outcome');
    return;
  }
  const modules = r.remediation.map(entry => entry?.moduleId);
  if (!modules.length || new Set(modules).size !== modules.length || !same(modules, definition.modules.filter(m => modules.includes(m.id)).map(m => m.id))) fail('invalid_outcome');
  for (const entry of r.remediation) {
    const module = definition.modules.find(m => m.id === entry.moduleId);
    if (!same(entry, { moduleId: module.id, title: module.title,
      unitIds: definition.units.filter(u => u.moduleId === module.id).map(u => u.id),
      instruction: 'Revisit this module and its practice before another final review. This result does not verify remediation completion.' })) fail('invalid_outcome');
  }
  const m = o.remediation;
  if (!exact(m, manifestKeys) || !sha(m.contentDigest) || m.courseKey !== `${definition.courseKey}-remediation-${intent.finalAttemptId}` ||
      m.sourceCourseKey !== definition.courseKey || m.sourceContentDigest !== definition.contentDigest ||
      m.definitionDigest !== definition.digest || m.finalAttemptId !== intent.finalAttemptId || m.reviewAttemptId !== intent.attemptId ||
      !same(m.moduleIds, modules) || !same(m.unitIds, definition.units.filter(u => modules.includes(u.moduleId)).map(u => u.id)) ||
      m.completed !== false || m.retakeEnabled !== false || o.workflowRevision !== 1) fail('invalid_outcome');
}

export async function transactNmlsFirstFinalSubmission(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  evaluate = createNmlsFirstFinalSubmissionEvaluator(), clockRetries = 1,
} = {}) {
  validateNmlsFirstFinalSubmissionInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc, courseFor, definitionFor, evaluate].some(fn => typeof fn !== 'function') ||
      !integer(clockRetries) || clockRetries > 1) fail('invalid_dependencies');
  const intent = structuredClone(input), commandDigest = digestNmlsCommand(intent);
  const { attemptId, finalAttemptId, expectedSourceRevision, expectedFinalRevision, ...command } = intent;
  const { answers, ...pauseIntent } = intent;
  const deliveryDigest = digestNmlsCommand({ ...pauseIntent, kind: 'pause' });
  const contextArgs = { p_student_id: studentId, p_attempt_id: attemptId, p_final_id: finalAttemptId, p_event_id: command.eventId };
  for (let retry = 0; ; retry++) {
    const context = structuredClone(await rpc('nmls_first_final_submission_context', structuredClone(contextArgs)));
    if (!plain(context) || context.attempt?.id !== attemptId || context.reservedFinal?.id !== finalAttemptId ||
        !plain(context.actorPolicy) || ['delivery', 'deliveryEvent', 'submissionEvent', 'workflow'].some(k =>
          !Object.hasOwn(context, k) || context[k] !== null && !plain(context[k]))) fail('context_scope');
    const sourceCourse = structuredClone(courseFor(context.attempt.course_key));
    const definition = structuredClone(definitionFor(sourceCourse.id));
    const { ledger, serverTimeMs: at } = validateNmlsPolicyContext(context, studentId, sourceCourse);
    requireNmlsFinalReviewCompletion(definition, context.attempt.runtime);
    if (definition.courseKey !== sourceCourse.id || definition.contentDigest !== sourceCourse.digest ||
        definition.sourcePayloadDigest !== digestNmlsCommand(sourceCourse)) fail('source_changed');
    const f = context.reservedFinal;
    if (f.student_id !== studentId || f.review_attempt_id !== attemptId || f.course_key !== sourceCourse.id ||
        f.content_digest !== sourceCourse.digest || f.definition_digest !== definition.digest || ![1, 2].includes(f.revision) ||
        !plain(f.selection) || f.selection.id !== finalAttemptId || f.selection.reviewAttemptId !== attemptId ||
        f.selection.definitionDigest !== definition.digest || f.selection.number !== 1 ||
        (f.revision === 1 ? ['answers', 'result', 'remediation_manifest', 'submitted_at'].some(k => f[k] !== null) :
          !plain(f.answers) || !plain(f.result) || typeof f.submitted_at !== 'string' || !Number.isFinite(Date.parse(f.submitted_at)))) fail('final_scope');
    const phase = { version: 'nmls-first-final-phase-v1', actorId: studentId, reviewAttemptId: attemptId,
      finalAttemptId, courseKey: sourceCourse.id, contentDigest: sourceCourse.digest,
      definitionDigest: definition.digest, selectionDigest: digestNmlsCommand(f.selection), offeringId: context.binding.offering.id };
    const row = context.delivery;
    if (row && (row.final_id !== finalAttemptId || row.student_id !== studentId || row.review_attempt_id !== attemptId ||
        !same(row.phase_scope, phase) || !integer(row.revision) || row.revision < 1 || row.runtime?.revision !== row.revision ||
        row.runtime.finalAttemptId !== finalAttemptId || row.runtime.phaseDigest !== digestNmlsCommand(phase))) fail('sidecar_scope');
    // A sealed form cannot be rebuilt into a reserved branded context. Replay
    // and stale intents go directly to locked SQL resolution, without grading.
    const stale = context.submissionEvent !== null || context.deliveryEvent !== null ||
      expectedSourceRevision !== context.attempt.revision || expectedFinalRevision !== f.revision ||
      command.expectedRevision !== (row?.revision ?? 0) || command.expectedActorRevision !== ledger.revision ||
      command.sessionId !== (row?.runtime.sessionId ?? null);
    let proposal = null, transition = {};
    if (!stale) {
      const final = makeNmlsFirstFinalDeliveryContext({ actorId: studentId, review: context.attempt, binding: context.binding,
        sourceCourse, definition, reservedFinal: f, reservation: context.reservation,
        teachingEvent: context.teachingEvent, actorPolicy: context.actorPolicy });
      const runtime = structuredClone(row?.runtime ?? startNmlsFirstFinalDelivery(final.finalPhase));
      const evaluationContext = { ...final, sourceCourse, runtime, ledger, command,
        evidence: { actorId: studentId, receivedAtMs: at } };
      proposal = await evaluate({ ...final, sourceCourse: structuredClone(sourceCourse), runtime: structuredClone(runtime),
        ledger: structuredClone(ledger), command: structuredClone(command), evidence: structuredClone(evaluationContext.evidence) });
      // Separate immutable inputs and exact structural equality reject forged
      // grades/child progress/undefined extras before the independent SQL guard.
      const expected = createNmlsFirstFinalSubmissionEvaluator()(evaluationContext);
      if (!same(proposal, expected)) fail('invalid_transition');
      transition = { phase: nmlsFinalDeliveryScope(final.finalPhase), command: proposal.command,
        ...proposal.closing, submission: proposal.submission };
    }
    const freshOutcome = proposal ? structuredClone(expectedOutcome(intent, proposal)) : null;
    let result;
    try {
      result = structuredClone(await rpc('nmls_first_final_submission_commit', {
        ...contextArgs, p_command_digest: commandDigest, p_expected_source_revision: expectedSourceRevision,
        p_expected_final_revision: expectedFinalRevision, p_expected_delivery_revision: command.expectedRevision,
        p_expected_actor_revision: command.expectedActorRevision, p_expected_session_id: command.sessionId,
        p_evaluated_at_ms: at, p_definition_digest: definition.digest, p_intent: structuredClone(intent), p_transition: structuredClone(transition),
      }));
    } catch (error) {
      if (retry < clockRetries && /nmls_(?:first_final_submission|first_final_delivery|final_delivery|review)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    if (!exact(result, ['duplicate', 'outcome']) || typeof result.duplicate !== 'boolean') fail('invalid_commit_response');
    outcomeShape(result.outcome, intent, definition);
    if (!result.duplicate) {
      if (!proposal || !same(result.outcome, freshOutcome)) fail('invalid_commit_response');
    } else {
      // A concurrent request can finish between context read and commit. Resolve
      // its immutable paired receipt once; never reconstruct or regrade it.
      const replayContext = context.submissionEvent ? context : structuredClone(
        await rpc('nmls_first_final_submission_context', structuredClone(contextArgs)));
      const event = replayContext?.submissionEvent, delivery = replayContext?.deliveryEvent, sealed = replayContext?.reservedFinal;
      const o = result.outcome;
      if (!plain(event) || event.student_id !== studentId || event.event_id !== command.eventId || event.final_id !== finalAttemptId ||
          event.review_attempt_id !== attemptId || event.command_digest !== commandDigest || event.delivery_command_digest !== deliveryDigest ||
          event.definition_digest !== definition.digest || event.source_revision !== expectedSourceRevision || event.final_revision !== o.finalRevision ||
          event.delivery_revision !== o.deliveryRevision || event.actor_revision !== o.actorRevision || event.workflow_revision !== o.workflowRevision ||
          event.submitted !== o.submitted || !same(event.outcome, o) || !integer(event.transaction_id) || event.transaction_id < 1 ||
          !plain(delivery) || delivery.student_id !== studentId || delivery.event_id !== command.eventId ||
          delivery.final_id !== finalAttemptId || delivery.review_attempt_id !== attemptId || delivery.command_digest !== deliveryDigest ||
          delivery.definition_digest !== definition.digest || delivery.source_revision !== expectedSourceRevision || delivery.final_revision !== 1 ||
          delivery.delivery_revision !== o.deliveryRevision || delivery.actor_revision !== o.actorRevision || delivery.transaction_id !== event.transaction_id ||
          delivery.audit?.kind !== 'pause' || delivery.audit?.eventId !== command.eventId || !same(delivery.audit?.phase, phase) ||
          delivery.runtime?.revision !== o.deliveryRevision || delivery.runtime?.phaseDigest !== digestNmlsCommand(phase) ||
          delivery.runtime?.sessionId !== command.sessionId || delivery.runtime?.creditIssuanceAllowed !== false ||
          delivery.outcome?.code !== o.deliveryCode || delivery.outcome?.policyCode !== o.policyCode ||
          delivery.outcome?.observationCode !== o.observationCode || delivery.outcome?.actorRevision !== o.actorRevision ||
          delivery.outcome?.revision !== o.deliveryRevision || delivery.outcome?.runtimeStatus !== delivery.runtime?.status ||
          delivery.outcome?.candidateMaterialAllowed !== false || delivery.outcome?.candidateUntilMs !== null ||
          delivery.outcome?.candidateWindow !== null || delivery.outcome?.deliveryAllowed !== false ||
          replayContext.delivery?.revision === o.deliveryRevision && !same(replayContext.delivery.runtime, delivery.runtime)) fail('invalid_commit_response');
      let childRuntime = null;
      if (o.remediation !== null) {
        const m = o.remediation;
        childRuntime = { mode: 'non_credit_review', creditIssuanceAllowed: false, courseKey: m.courseKey,
          contentDigest: m.contentDigest, revision: 0, status: 'logged_out', sessionId: null, lastActivityMs: null,
          lastReceiptMs: 0, completedUnitIds: [], completedReviewMs: 0, passedModuleIds: [], current: null, quiz: null, feedback: null };
      }
      const submissionPayload = { submitted: o.submitted, code: o.submissionCode,
        answers: o.submitted ? intent.answers : null, result: o.result, manifest: o.remediation, childRuntime };
      if (event.submission_payload_digest !== digestNmlsCommand(submissionPayload) || o.submitted &&
          (!plain(sealed) || sealed.revision !== 2 || !same(sealed.answers, intent.answers) || !same(sealed.result, o.result) ||
            !same(sealed.remediation_manifest, o.remediation))) fail('invalid_commit_response');
    }
    return { status: result.outcome.status, body: { ...structuredClone(result.outcome), duplicate: result.duplicate } };
  }
}
