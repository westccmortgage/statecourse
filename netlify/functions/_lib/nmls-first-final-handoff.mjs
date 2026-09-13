import { isDeepStrictEqual as same } from 'node:util';
import { createHash } from 'node:crypto';
import { makeNmlsFirstFinalHandoffContext, createNmlsFirstFinalHandoffEvaluator,
  validateNmlsFirstFinalHandoffCommand, validateNmlsFirstFinalHandoffHistory } from '../../../lib/nmls-first-final-handoff.mjs';
import { nmlsTeachingPhaseScope } from '../../../lib/nmls-teaching-phase.mjs';
import { compactNmlsReviewOutcome, startNmlsCourseReview, projectNmlsReview } from '../../../lib/nmls-review-runtime.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand } from './nmls-review-service.mjs';
import { validateNmlsPolicyContext } from './nmls-policy-transaction.mjs';

// PRIVATE SERVER TRANSPORT. No HTTP handler imports this module. A failed
// first final hands off to its own empty child through the actual032 resume.
//037 alone commits that custody change. No material, time, grade, retake or
// credit is issued by this response, including a positive control transition.
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const integer = v => Number.isSafeInteger(v) && v >= 0;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const fail = code => { throw new Error(`nmls_first_final_handoff_${code}`); };
const outcomeKeys = ['ok', 'code', 'status', 'handedOff', 'finalAttemptId', 'finalRevision', 'sourceRevision',
  'deliveryRevision', 'workflowRevision', 'runtimeRevision', 'actorRevision', 'sessionId', 'runtimeStatus',
  'teachingOk', 'teachingStatus', 'teachingCode', 'policyCode', 'observationCode', 'mode', 'deliveryAllowed',
  'studentDeliveryEnabled', 'creditIssuanceAllowed', 'retakeEnabled'];
const policyCodes = new Set(['delivery_not_open', 'delivery_window_closed', 'rocs_document_unverified',
  'rocs_required', 'session_policy_allowed', 'break_in_progress', 'mandatory_break_required',
  'rolling_study_limit', 'session_wall_limit']);

export const validateNmlsFirstFinalHandoffInput = validateNmlsFirstFinalHandoffCommand;

function metadata(intent, runtime, teaching) {
  return { ok: true, code: 'private_first_remediation_handed_off', status: 200, handedOff: true,
    finalAttemptId: intent.finalAttemptId, finalRevision: 2, sourceRevision: intent.expectedSourceRevision,
    deliveryRevision: intent.expectedDeliveryRevision, workflowRevision: 2, runtimeRevision: 1,
    actorRevision: teaching.actorRevision, sessionId: runtime.sessionId, runtimeStatus: runtime.status,
    teachingOk: teaching.ok, teachingStatus: teaching.status, teachingCode: teaching.code,
    policyCode: teaching.policyCode, observationCode: teaching.observationCode,
    mode: 'private_authoring_review', deliveryAllowed: false, studentDeliveryEnabled: false,
    creditIssuanceAllowed: false, retakeEnabled: false };
}

function outcomeShape(o, intent) {
  if (!exact(o, outcomeKeys) || o.ok !== true || o.code !== 'private_first_remediation_handed_off' ||
      o.status !== 200 || o.handedOff !== true || o.finalAttemptId !== intent.finalAttemptId ||
      o.finalRevision !== 2 || o.sourceRevision !== intent.expectedSourceRevision ||
      o.deliveryRevision !== intent.expectedDeliveryRevision || o.workflowRevision !== 2 || o.runtimeRevision !== 1 ||
      o.actorRevision !== intent.expectedActorRevision + 1 || !integer(o.actorRevision) ||
      !['active', 'logged_out'].includes(o.runtimeStatus) ||
      (o.runtimeStatus === 'active' ? !uuid(o.sessionId) || o.sessionId === intent.sessionId : o.sessionId !== null) ||
      o.teachingOk !== (o.runtimeStatus === 'active') || o.teachingStatus !== (o.teachingOk ? 200 : 401) ||
      o.teachingCode !== (o.teachingOk ? 'review_session_started' : 'course_logout_required') ||
      !policyCodes.has(o.policyCode) || !['study_observation_ready', 'outside_window_no_settlement'].includes(o.observationCode) ||
      o.mode !== 'private_authoring_review' || o.deliveryAllowed !== false || o.studentDeliveryEnabled !== false ||
      o.creditIssuanceAllowed !== false || o.retakeEnabled !== false) fail('invalid_outcome');
  const outside = ['delivery_not_open', 'delivery_window_closed'].includes(o.policyCode);
  if (outside !== (o.observationCode === 'outside_window_no_settlement') ||
      o.teachingOk === (outside || o.policyCode === 'rocs_document_unverified')) fail('invalid_outcome');
}

function derivedCommand(intent) {
  return { kind: 'resume', attemptId: intent.attemptId, eventId: intent.eventId,
    phaseKind: 'remediation', phaseOwnerId: intent.finalAttemptId,
    expectedSourceRevision: intent.expectedSourceRevision, expectedWorkflowRevision: 1,
    expectedRevision: 0, expectedActorRevision: intent.expectedActorRevision, sessionId: null };
}

function layoutFor(course) {
  return course.modules.map(m => ({ id: m.id, units: m.units.map(u => ({ id: u.id,
    requiredMs: u.requiredSeconds * 1000, requiredActionIds: [u.actionQuestion.id] })),
    passPercent: m.quiz.passPercent, questionsPerAttempt: m.quiz.questionsPerAttempt }));
}

function historyInput(context, actorId, sourceCourse, definition) {
  return { actorId, sourceCourse, definition, review: context.attempt, binding: context.binding,
    firstFinal: context.reservedFinal, workflow: context.workflow, actorPolicy: context.actorPolicy,
    lease: context.lease, delivery: context.delivery, submissionEvent: context.genesisEvent,
    deliveryEvent: context.genesisDeliveryEvent, reservation: context.reservation, teachingEvent: context.teachingEvent };
}

function basicContext(context, actor, intent, course, definition) {
  if (!plain(context) || context.attempt?.id !== intent.attemptId || context.reservedFinal?.id !== intent.finalAttemptId ||
      !plain(context.actorPolicy) || !plain(context.delivery) || !plain(context.lease) ||
      !plain(context.workflow) || !plain(context.genesisEvent) || !plain(context.genesisDeliveryEvent) ||
      ['handoffEvent', 'handoffTeachingEvent'].some(k => !Object.hasOwn(context, k) || context[k] !== null && !plain(context[k]))) fail('context_scope');
  const policy = validateNmlsPolicyContext(context, actor, course);
  const { digest, ...source } = course;
  if (createHash('sha256').update(JSON.stringify(source)).digest('hex') !== digest ||
      definition.courseKey !== course.id || definition.contentDigest !== course.digest ||
      definition.sourcePayloadDigest !== digestNmlsCommand(course)) fail('source_changed');
  const f = context.reservedFinal, w = context.workflow, d = context.delivery, g = context.genesisEvent;
  if (f.student_id !== actor || f.review_attempt_id !== intent.attemptId || f.course_key !== course.id ||
      f.content_digest !== course.digest || f.definition_digest !== definition.digest || f.revision !== 2 ||
      f.result?.passed !== false || f.selection?.number !== 1 || f.selection.id !== f.id ||
      f.selection.reviewAttemptId !== intent.attemptId || f.selection.definitionDigest !== definition.digest ||
      typeof f.submitted_at !== 'string' || !Number.isFinite(Date.parse(f.submitted_at)) ||
      w.student_id !== actor || w.review_attempt_id !== intent.attemptId || w.first_final_id !== f.id ||
      w.definition_digest !== definition.digest || !same(w.manifest, f.remediation_manifest) ||
      !integer(w.revision) || !integer(w.runtime?.revision) ||
      g.student_id !== actor || g.final_id !== f.id || g.review_attempt_id !== intent.attemptId ||
      g.definition_digest !== definition.digest || g.submitted !== true || g.final_revision !== 2 ||
      g.workflow_revision !== 1 || g.outcome?.result?.passed !== false ||
      d.final_id !== f.id || d.student_id !== actor || d.review_attempt_id !== intent.attemptId ||
      d.revision !== g.delivery_revision || d.runtime?.revision !== d.revision || d.runtime.status !== 'paused' ||
      !same(d.runtime, context.genesisDeliveryEvent.runtime)) fail('context_scope');
  // Validate original immutable history even for stale/replayed commands,
  // without regenerating a child, evaluating a transition or regrading a test.
  const origin = validateNmlsFirstFinalHandoffHistory(historyInput(context, actor, course, definition));
  if (policy.serverTimeMs < origin.notBeforeMs) fail('invalid_server_time');
  const phase = { version: 'nmls-teaching-phase-v1', kind: 'remediation', ownerId: f.id,
    sourceCourseKey: course.id, sourceContentDigest: course.digest, teachingCourseKey: w.manifest.courseKey,
    policyDigest: context.binding.policy_digest, definitionDigest: definition.digest,
    manifestDigest: digestNmlsCommand(w.manifest) };
  return { ...policy, phase };
}

function verifyReplay(context, result, actor, intent, course, definition, phase) {
  const e = context?.handoffEvent, t = context?.handoffTeachingEvent, o = result.outcome;
  if (!plain(e) || !plain(t) || e.student_id !== actor || e.event_id !== intent.eventId ||
      e.final_id !== intent.finalAttemptId || e.review_attempt_id !== intent.attemptId ||
      e.genesis_event_id !== context.genesisEvent?.event_id || e.command_digest !== digestNmlsCommand(intent) ||
      e.teaching_command_digest !== digestNmlsCommand(derivedCommand(intent)) || e.definition_digest !== definition.digest ||
      e.teaching_digest !== context.workflow?.manifest.contentDigest || !same(e.phase_scope, phase) ||
      e.source_revision !== intent.expectedSourceRevision || e.final_revision !== 2 ||
      e.delivery_revision !== intent.expectedDeliveryRevision || e.workflow_revision !== 2 || e.runtime_revision !== 1 ||
      e.actor_revision !== intent.expectedActorRevision + 1 || !integer(e.transaction_id) || e.transaction_id < 1 ||
      !same(e.outcome, o) || t.student_id !== actor || t.event_id !== intent.eventId ||
      t.review_attempt_id !== intent.attemptId || t.phase_kind !== 'remediation' || t.phase_owner_id !== intent.finalAttemptId ||
      t.command_digest !== e.teaching_command_digest || t.actor_revision !== e.actor_revision ||
      t.source_revision !== e.source_revision || t.workflow_revision !== 2 || t.runtime_revision !== 1 ||
      t.transaction_id !== e.transaction_id || !same(t.lease_before, e.lease_before) || !same(t.lease_after, e.lease_after) ||
      t.audit?.review?.kind !== 'resume' || !same(metadata(intent, e.runtime ?? {}, t.outcome ?? {}), o) ||
      context.attempt.revision < e.source_revision || context.actorPolicy.revision < e.actor_revision ||
      context.workflow.revision < e.workflow_revision || context.workflow.runtime.revision < e.runtime_revision) fail('invalid_commit_response');
  const before = e.lease_before, r = e.runtime;
  if (!plain(before) || before.student_id !== actor || before.attempt_id !== intent.attemptId ||
      before.phase_kind !== 'final' || before.phase_owner_id !== intent.finalAttemptId || before.phase_active !== false ||
      before.session_id !== intent.sessionId || !same(e.lease_after, { ...before, phase_kind: 'remediation',
        phase_owner_id: intent.finalAttemptId, phase_active: r.status === 'active', session_id: r.sessionId ?? before.session_id }) ||
      !integer(r.lastReceiptMs) || r.lastReceiptMs < Date.parse(context.reservedFinal.submitted_at) ||
      !same(r, { ...startNmlsCourseReview({ id: phase.teachingCourseKey, digest: e.teaching_digest }),
        revision: 1, status: o.runtimeStatus, sessionId: o.sessionId, lastReceiptMs: r.lastReceiptMs,
        lastActivityMs: o.runtimeStatus === 'active' ? r.lastReceiptMs : null }) ||
      t.outcome?.progress?.revision !== 1 || t.outcome.progress.status !== r.status ||
      t.outcome.progress.sessionId !== r.sessionId || t.outcome.progress.courseKey !== r.courseKey ||
      t.outcome.progress.contentDigest !== r.contentDigest || t.outcome.progress.creditIssuanceAllowed !== false ||
      !same(t.outcome.progress.lessons, []) || t.outcome.progress.quiz !== null || t.outcome.progress.feedback !== null ||
      t.outcome.deliveryAllowed !== false || t.outcome.deliveryUntilMs !== null ||
      t.outcome.studyWindow !== null || t.outcome.studyRecovery !== null || t.outcome.teachingPhaseComplete !== false ||
      context.workflow.revision === 2 && !same(context.workflow.runtime, r)) fail('invalid_commit_response');
  const historicalChild = { id: phase.teachingCourseKey, digest: e.teaching_digest,
    title: 'Private final review — targeted module practice',
    modules: course.modules.filter(m => context.workflow.manifest.moduleIds.includes(m.id)) };
  const progress = compactNmlsReviewOutcome({ progress: projectNmlsReview(r, historicalChild) }).progress;
  const outside = o.observationCode === 'outside_window_no_settlement';
  const reviewAudit = { kind: 'resume', atMs: r.lastReceiptMs, ...(r.status === 'active' ? {
    reason: 'explicit_resume_current_unit_restart', invalidatedMs: 0, invalidatedUnitId: null, abandonedQuizId: null,
  } : {}) };
  const audit = { review: reviewAudit, policy: { kind: 'open_session', code: o.policyCode,
    atMs: r.lastReceiptMs, actorId: actor, offeringId: context.binding.offering.id,
    contentDigest: course.digest, policyId: context.binding.policy_id }, observation: outside ?
    { reason: 'outside_window_preserved' } : { reason: 'no_prior_material', code: 'study_observation_ready' } };
  if (!same(t.outcome.progress, progress) || !same(t.audit, audit)) fail('invalid_commit_response');
}

export async function transactNmlsFirstFinalHandoff(input, studentId, {
  rpc, courseFor = getNmlsReviewCourse, definitionFor = getNmlsDraftFinalDefinition,
  evaluate = createNmlsFirstFinalHandoffEvaluator(), clockRetries = 1,
} = {}) {
  validateNmlsFirstFinalHandoffInput(input);
  if (!uuid(studentId)) fail('invalid_authenticated_actor');
  if ([rpc, courseFor, definitionFor, evaluate].some(fn => typeof fn !== 'function') ||
      !integer(clockRetries) || clockRetries > 1) fail('invalid_dependencies');
  // Caller inputs, RPC arguments/results and expected responses never share
  // mutable objects across an await. No request data selects trusted loaders.
  const intent = structuredClone(input), commandDigest = digestNmlsCommand(intent);
  const contextArgs = { p_student_id: studentId, p_attempt_id: intent.attemptId,
    p_final_id: intent.finalAttemptId, p_event_id: intent.eventId };
  for (let retry = 0; ; retry++) {
    const context = structuredClone(await rpc('nmls_first_final_handoff_context', structuredClone(contextArgs)));
    const course = structuredClone(courseFor(context?.attempt?.course_key));
    const definition = structuredClone(definitionFor(course.id));
    const { ledger, serverTimeMs: at, phase } = basicContext(context, studentId, intent, course, definition);
    const stale = context.handoffEvent !== null || context.handoffTeachingEvent !== null ||
      context.attempt.revision !== intent.expectedSourceRevision || context.reservedFinal.revision !== 2 ||
      context.delivery.revision !== intent.expectedDeliveryRevision || context.workflow.revision !== 1 ||
      context.workflow.runtime.revision !== 0 || ledger.revision !== intent.expectedActorRevision ||
      context.lease.phase_kind !== 'final' || context.lease.phase_owner_id !== intent.finalAttemptId ||
      context.lease.session_id !== intent.sessionId || context.lease.phase_active !== false;
    let transition = {}, expectedOutcome = null;
    if (!stale) {
      const handoff = makeNmlsFirstFinalHandoffContext(historyInput(context, studentId, course, definition));
      const evaluation = { ...handoff, command: structuredClone(intent), evidence: { actorId: studentId, receivedAtMs: at } };
      const proposal = await evaluate({ ...handoff, course: structuredClone(handoff.course), runtime: structuredClone(handoff.runtime),
        ledger: structuredClone(handoff.ledger), offering: structuredClone(handoff.offering),
        command: structuredClone(intent), evidence: structuredClone(evaluation.evidence) });
      const expected = await createNmlsFirstFinalHandoffEvaluator({ newId: () => proposal?.runtime?.sessionId })(evaluation);
      if (!same(proposal, expected) || !same(nmlsTeachingPhaseScope(handoff.teachingPhase), phase) ||
          !same(proposal.command, derivedCommand(intent))) fail('invalid_transition');
      transition = { phase, command: proposal.command, teachingDigest: handoff.course.digest,
        layout: layoutFor(handoff.course), runtime: proposal.runtime, ledger: proposal.ledger,
        outcome: compactNmlsReviewOutcome(proposal.outcome), audit: proposal.audit };
      expectedOutcome = structuredClone(metadata(intent, proposal.runtime, proposal.outcome));
      outcomeShape(expectedOutcome, intent);
    }
    let result;
    try {
      result = structuredClone(await rpc('nmls_first_final_handoff_commit', { ...contextArgs,
        p_command_digest: commandDigest, p_expected_source_revision: intent.expectedSourceRevision,
        p_expected_final_revision: 2, p_expected_delivery_revision: intent.expectedDeliveryRevision,
        p_expected_workflow_revision: 1, p_expected_runtime_revision: 0,
        p_expected_actor_revision: intent.expectedActorRevision, p_expected_session_id: intent.sessionId,
        p_evaluated_at_ms: at, p_definition_digest: definition.digest,
        p_intent: structuredClone(intent), p_transition: structuredClone(transition) }));
    } catch (error) {
      if (retry < clockRetries && /nmls_(?:first_final_handoff|first_final_submission|teaching|review)_clock_refresh_required/.test(String(error?.message))) continue;
      throw error;
    }
    if (!exact(result, ['duplicate', 'outcome']) || typeof result.duplicate !== 'boolean') fail('invalid_commit_response');
    outcomeShape(result.outcome, intent);
    if (!result.duplicate) {
      if (!expectedOutcome || !same(result.outcome, expectedOutcome)) fail('invalid_commit_response');
    } else {
      const historical = context.handoffEvent ? context : structuredClone(
        await rpc('nmls_first_final_handoff_context', structuredClone(contextArgs)));
      const historicalScope = basicContext(historical, studentId, intent, course, definition).phase;
      if (!same(historicalScope, phase)) fail('invalid_commit_response');
      verifyReplay(historical, result, studentId, intent, course, definition, phase);
    }
    return { status: result.outcome.status, body: { ...structuredClone(result.outcome), duplicate: result.duplicate } };
  }
}
