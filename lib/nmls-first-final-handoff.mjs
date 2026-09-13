import { createHash, randomUUID } from 'node:crypto';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';
import { makeNmlsRemediationTeachingContext, makeNmlsSourceTeachingContext } from './nmls-teaching-phase.mjs';
import { projectNmlsDraftFinal, requireNmlsFinalReviewCompletion } from './nmls-final-assessment.mjs';
import { startNmlsCourseReview } from './nmls-review-runtime.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from './nmls-study-observer.mjs';
import { validateNmlsUncertainExposure } from './nmls-uncertain-exposure.mjs';

// PRIVATE prospective domain composition. Trusted, freshly loaded rows are
// required; consistency is not proof of database origin, grant validity or
// identity. The joint writer must lock/recheck authority and save the real
// child resume, actor policy and lease together. No historical row is changed,
// no child lesson is opened and no attendance, credit or retake is authorized.
const tokens = new WeakMap();
const plain = x => x !== null && typeof x === 'object' && Object.getPrototypeOf(x) === Object.prototype;
const integer = x => Number.isSafeInteger(x) && x >= 0;
const instant = x => integer(x) && x <= 8.64e15;
const uuid = x => typeof x === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x);
const sha = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const date = x => typeof x === 'string' && x.trim().length > 0 && Number.isFinite(Date.parse(x));
const exact = (x, keys) => plain(x) && Object.keys(x).length === keys.length && keys.every(k => Object.hasOwn(x, k));
const stable = x => Array.isArray(x) ? x.map(stable) : plain(x) ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
const same = (a, b) => a !== undefined && b !== undefined && hash(a) === hash(b);
const freeze = x => { if (x && typeof x === 'object') { for (const v of Object.values(x)) freeze(v); Object.freeze(x); } return x; };
const fail = code => { throw new Error(`nmls_first_final_handoff_${code}`); };
const leaseFor = (actorId, reviewId, ownerId, sessionId, kind, active) => ({ student_id: actorId,
  attempt_id: reviewId, session_id: sessionId, phase_kind: kind, phase_owner_id: ownerId, phase_active: active });

// Validate the actual033/032 reservation pair directly. A sealed first form
// must never be disguised as an unsubmitted form to mint an old final token.
function reservationOrigin(i) {
  const { actorId, review, binding, sourceCourse, definition, firstFinal: first,
    reservation: r, teachingEvent: e } = i;
  if (!plain(r) || !plain(e) || !uuid(r.event_id) || e.event_id !== r.event_id ||
      r.student_id !== actorId || e.student_id !== actorId || r.review_attempt_id !== review.id ||
      e.review_attempt_id !== review.id || !sha(r.command_digest) || e.command_digest !== r.command_digest ||
      r.definition_digest !== definition.digest || r.reserved !== true || r.final_id !== first.id ||
      r.selection_digest !== hash(first.selection) || !date(r.recorded_at) || !date(e.recorded_at) ||
      e.phase_kind !== 'source' || e.phase_owner_id !== review.id || e.workflow_revision !== null ||
      !integer(r.source_revision) || r.source_revision < 1 || e.source_revision !== r.source_revision ||
      e.runtime_revision !== r.source_revision || review.revision < r.source_revision ||
      !integer(r.actor_revision) || r.actor_revision < 1 || e.actor_revision !== r.actor_revision ||
      !integer(e.transaction_id) || e.transaction_id < 1) fail('reservation_origin');
  if (!same(r.outcome, { ok: true, code: 'private_final_reserved', status: 200, reserved: true,
    finalAttemptId: first.id, finalRevision: 1, sourceRevision: r.source_revision, actorRevision: r.actor_revision,
    mode: 'private_authoring_review', studentDeliveryEnabled: false, creditIssuanceAllowed: false })) fail('reservation_origin');
  const o = e.outcome, a = e.audit, p = o?.progress;
  if (!plain(o) || o.ok !== true || o.status !== 200 ||
      !['review_policy_checked', 'session_policy_allowed'].includes(o.code) || o.policyCode !== 'session_policy_allowed' ||
      o.observationReady !== true || o.observationCode !== 'study_observation_ready' ||
      o.deliveryAllowed !== false || o.deliveryUntilMs !== null || o.studyWindow !== null || o.studyRecovery !== null ||
      o.teachingPhaseComplete !== true || o.actorRevision !== r.actor_revision ||
      !plain(p) || p.mode !== 'non_credit_review' || p.creditIssuanceAllowed !== false || p.courseKey !== sourceCourse.id ||
      p.contentDigest !== sourceCourse.digest || p.status !== 'review_complete' || p.revision !== r.source_revision ||
      p.sessionId !== review.runtime.sessionId || !uuid(p.sessionId) || p.currentUnitId !== null || p.provisionalReviewMs !== 0 ||
      p.resumeRequired !== false || !same(p.completedUnitIds, review.runtime.completedUnitIds) ||
      !same(p.passedModuleIds, review.runtime.passedModuleIds) || p.completedReviewMs !== review.runtime.completedReviewMs ||
      !same(p.lessons, []) || p.quiz !== null || p.feedback !== null) fail('reservation_origin');
  if (!plain(a?.review) || !plain(a.policy) || a.review.kind !== 'check_access' || a.policy.kind !== 'check_access' ||
      a.policy.code !== 'session_policy_allowed' || !instant(a.review.atMs) || a.policy.atMs !== a.review.atMs ||
      a.policy.actorId !== actorId || a.policy.offeringId !== binding.offering.id || a.policy.contentDigest !== sourceCourse.digest ||
      a.policy.policyId !== binding.policy_id || a.review.atMs < binding.offering.opensAtMs ||
      a.review.atMs >= binding.offering.closesAtMs || Object.hasOwn(a.policy, 'observation') ||
      !same(a.observation, { reason: 'no_prior_material', code: 'study_observation_ready' }) ||
      review.runtime.lastReceiptMs < a.review.atMs) fail('reservation_origin');
  const lease = leaseFor(actorId, review.id, review.id, p.sessionId, 'source', false);
  if (!same(e.lease_before, lease) || !same(e.lease_after, lease)) fail('reservation_origin');
  return Math.max(a.review.atMs, Date.parse(r.recorded_at), Date.parse(e.recorded_at));
}

function submissionOrigin(i, child, phase, reservedAt, mode = 'fresh') {
  if (!['fresh', 'historical'].includes(mode)) fail('invalid_history_mode');
  const { actorId, review, binding, definition, firstFinal: first, workflow, delivery: d,
    submissionEvent: s, deliveryEvent: e, lease } = i;
  if (!plain(s) || !plain(e) || !uuid(s.event_id) || e.event_id !== s.event_id ||
      s.student_id !== actorId || e.student_id !== actorId || s.review_attempt_id !== review.id || e.review_attempt_id !== review.id ||
      s.final_id !== first.id || e.final_id !== first.id || s.definition_digest !== definition.digest || e.definition_digest !== definition.digest ||
      s.submitted !== true || s.final_revision !== 2 || e.final_revision !== 1 || s.workflow_revision !== 1 ||
      !integer(s.source_revision) || s.source_revision < i.reservation.source_revision || review.revision < s.source_revision ||
      e.source_revision !== s.source_revision || !integer(s.actor_revision) || s.actor_revision <= i.reservation.actor_revision ||
      e.actor_revision !== s.actor_revision || !integer(s.delivery_revision) || s.delivery_revision < 3 ||
      e.delivery_revision !== s.delivery_revision || !integer(s.transaction_id) || s.transaction_id < 1 ||
      e.transaction_id !== s.transaction_id || !date(s.recorded_at) || !date(e.recorded_at)) fail('submission_origin');
  if (!plain(d) || d.student_id !== actorId || d.review_attempt_id !== review.id || d.final_id !== first.id ||
      !same(d.phase_scope, phase) || d.revision !== s.delivery_revision || !same(d.runtime, e.runtime)) fail('delivery_origin');
  const r = d.runtime, a = e.audit, o = e.outcome, w = a?.observation?.windowBefore;
  if (!exact(r, ['version', 'finalAttemptId', 'phaseDigest', 'revision', 'status', 'sessionId', 'lastActivityMs', 'lastReceiptMs', 'creditIssuanceAllowed']) ||
      r.version !== 'nmls-first-final-delivery-v1' || r.finalAttemptId !== first.id || r.phaseDigest !== hash(phase) ||
      r.revision !== d.revision || r.status !== 'paused' || !uuid(r.sessionId) || !instant(r.lastActivityMs) ||
      !instant(r.lastReceiptMs) || r.lastActivityMs > r.lastReceiptMs || r.creditIssuanceAllowed !== false) fail('delivery_origin');
  const beforeLease = leaseFor(actorId, review.id, first.id, r.sessionId, 'final', true);
  const afterLease = { ...beforeLease, phase_active: false };
  if (!same(e.lease_before, beforeLease) || !same(e.lease_after, afterLease) ||
      mode === 'fresh' && !same(lease, afterLease)) fail('lease_scope');
  if (!exact(a, ['eventId', 'kind', 'atMs', 'phase', 'runtimeBeforeRevision', 'policy', 'observation', 'instructionalTimeAddedMs', 'creditAddedMs']) ||
      a.eventId !== s.event_id || a.kind !== 'pause' || !instant(a.atMs) || a.atMs < reservedAt ||
      a.atMs !== r.lastReceiptMs || a.atMs < binding.offering.opensAtMs || a.atMs >= binding.offering.closesAtMs ||
      !same(a.phase, phase) || a.runtimeBeforeRevision !== r.revision - 1 || a.instructionalTimeAddedMs !== 0 || a.creditAddedMs !== 0 ||
      a.atMs >= r.lastActivityMs + R.idleLogoutMs || Date.parse(first.submitted_at) < a.atMs ||
      Date.parse(s.recorded_at) < a.atMs || Date.parse(e.recorded_at) < a.atMs ||
      !plain(a.policy) || a.policy.kind !== 'check_access' || a.policy.code !== 'session_policy_allowed' || a.policy.atMs !== a.atMs ||
      a.policy.actorId !== actorId || a.policy.offeringId !== binding.offering.id || a.policy.contentDigest !== phase.contentDigest ||
      a.policy.policyId !== binding.policy_id ||
      !exact(a.observation, ['windowBefore', 'firstAcknowledgment', 'signal', 'closedWindow']) ||
      a.observation.firstAcknowledgment !== false || a.observation.signal !== 'authenticated_material_receipt_not_identity_proof') fail('closing_audit');
  if (!exact(w, ['id', 'scope', 'materialDigest', 'runtimeRevision', 'openingEventId', 'issuedAtMs', 'horizonMs', 'lastObservedAtMs']) ||
      !uuid(w.id) || !uuid(w.openingEventId) || w.runtimeRevision !== r.revision - 1 || w.materialDigest !== phase.selectionDigest ||
      !same(w.scope, { actorId, attemptId: review.id, offeringId: binding.offering.id, contentDigest: phase.contentDigest,
        sessionId: r.sessionId, finalPhase: phase }) || !instant(w.issuedAtMs) || !instant(w.lastObservedAtMs) ||
      !instant(w.horizonMs) || w.issuedAtMs < reservedAt || w.issuedAtMs > w.lastObservedAtMs ||
      w.lastObservedAtMs > a.atMs || a.atMs >= w.horizonMs || w.horizonMs > binding.offering.closesAtMs ||
      w.horizonMs - w.lastObservedAtMs > P.maximumObservationMs ||
      !same(a.observation.closedWindow, { ...w, lastObservedAtMs: a.atMs })) fail('closing_window');
  const policyAudit = { kind: 'check_access', code: 'session_policy_allowed', atMs: a.atMs, actorId,
    offeringId: binding.offering.id, contentDigest: phase.contentDigest, policyId: binding.policy_id,
    ...(w.lastObservedAtMs < a.atMs ? { observation: { kind: 'observe_study', code: 'study_interval_recorded',
      atMs: a.atMs, actorId, offeringId: binding.offering.id, contentDigest: phase.contentDigest, policyId: binding.policy_id } } : {}) };
  if (!same(a.policy, policyAudit)) fail('closing_audit');
  if (!same(o, { ok: true, code: 'final_paused', status: 200, finalAttemptId: first.id, finalRevision: 1,
    revision: s.delivery_revision, actorRevision: s.actor_revision, runtimeStatus: 'paused', candidateMaterialAllowed: false,
    candidateUntilMs: null, candidateWindow: null, recovery: null, resumeNotBeforeMs: null,
    policyCode: 'session_policy_allowed', observationCode: 'receipt_continuous', mode: 'private_transition_candidate',
    deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false })) fail('closing_outcome');
  const pause = { kind: 'pause', attemptId: review.id, finalAttemptId: first.id, eventId: s.event_id,
    expectedSourceRevision: s.source_revision, expectedFinalRevision: 1, expectedRevision: s.delivery_revision - 1,
    expectedActorRevision: s.actor_revision - 1, sessionId: r.sessionId, studyReceipt: { windowId: w.id, visible: true } };
  if (s.delivery_command_digest !== hash(pause) || e.command_digest !== hash(pause) ||
      s.command_digest !== hash({ ...pause, kind: 'submit_first_final', answers: first.answers }) ||
      s.submission_payload_digest !== hash({ submitted: true, code: 'first_final_submission_allowed', answers: first.answers,
        result: first.result, manifest: first.remediation_manifest, childRuntime: startNmlsCourseReview(child) }) ||
      !same(s.outcome, { ok: true, code: 'private_first_final_submitted', status: 200, submitted: true,
        finalAttemptId: first.id, finalRevision: 2, sourceRevision: s.source_revision, actorRevision: s.actor_revision,
        deliveryRevision: s.delivery_revision, submissionCode: 'first_final_submission_allowed', deliveryCode: 'final_paused',
        policyCode: 'session_policy_allowed', observationCode: 'receipt_continuous', result: first.result,
        remediation: first.remediation_manifest, workflowRevision: 1, mode: 'private_authoring_review', deliveryAllowed: false,
        studentDeliveryEnabled: false, creditIssuanceAllowed: false, retakeEnabled: false }) ||
      mode === 'fresh' && (workflow.revision !== 1 || !same(workflow.runtime, startNmlsCourseReview(child)))) fail('submission_origin');
  return Math.max(a.atMs, Date.parse(first.submitted_at), Date.parse(s.recorded_at), Date.parse(e.recorded_at));
}

// NO GRADING OR CHILD-COURSE GENERATION. This verifies immutable saved origin
// consistency for fresh requests and replay after child progress. It does not
// mint a teaching token, validate the later handoff receipt, or authorize any
// current write. The writer still owns database provenance and current locks.
export function validateNmlsFirstFinalHandoffHistory(input) {
  if (!plain(input)) fail('invalid_context');
  const { actorId, review, binding, sourceCourse, definition, firstFinal: first, workflow, actorPolicy } = input;
  makeNmlsSourceTeachingContext({ actorId, review, binding, sourceCourse });
  requireNmlsFinalReviewCompletion(definition, review.runtime);
  if (definition.sourcePayloadDigest !== hash(sourceCourse) || definition.courseKey !== sourceCourse.id ||
      definition.contentDigest !== sourceCourse.digest) fail('source_changed');
  if (!plain(first) || !uuid(first.id) || first.id === review.id || first.student_id !== actorId ||
      first.review_attempt_id !== review.id || first.course_key !== sourceCourse.id || first.content_digest !== sourceCourse.digest ||
      first.definition_digest !== definition.digest || first.revision !== 2 || !date(first.issued_at) || !date(first.submitted_at) ||
      Date.parse(first.issued_at) > Date.parse(first.submitted_at) ||
      !exact(first.selection, ['schema', 'id', 'reviewAttemptId', 'definitionDigest', 'number', 'questionIds', 'optionOrder']) ||
      first.selection.number !== 1 || first.selection.id !== first.id || first.selection.reviewAttemptId !== review.id ||
      first.selection.definitionDigest !== definition.digest) fail('first_history');
  // Existing validator checks saved form IDs/quotas/options. Its private
  // question projection is discarded, never returned or used for grading.
  projectNmlsDraftFinal(definition, first.selection);
  if (!exact(first.answers, first.selection.questionIds) ||
      Object.values(first.answers).some(value => !['A', 'B', 'C', 'D'].includes(value))) fail('first_history');
  const result = first.result;
  if (!exact(result, ['mode', 'passed', 'correct', 'total', 'percent', 'requiredCorrect', 'assignedCreditSeconds',
    'creditIssuanceAllowed', 'courseCompletionIssued', 'disposition', 'remediation']) ||
      result.mode !== 'private_authoring_review' || result.passed !== false || !integer(result.correct) || result.correct >= 18 ||
      result.total !== 25 || result.percent !== result.correct * 4 || result.requiredCorrect !== 18 || result.assignedCreditSeconds !== 0 ||
      result.creditIssuanceAllowed !== false || result.courseCompletionIssued !== false || result.disposition !== 'remediation_required' ||
      !Array.isArray(result.remediation) || !result.remediation.length) fail('first_history');
  const ids = result.remediation.map(entry => entry?.moduleId);
  if (new Set(ids).size !== ids.length || !same(ids, definition.modules.filter(m => ids.includes(m.id)).map(m => m.id))) fail('manifest_history');
  for (const entry of result.remediation) {
    const module = definition.modules.find(m => m.id === entry.moduleId);
    if (!same(entry, { moduleId: module.id, title: module.title,
      unitIds: definition.units.filter(u => u.moduleId === module.id).map(u => u.id),
      instruction: 'Revisit this module and its practice before another final review. This result does not verify remediation completion.' })) fail('manifest_history');
  }
  const manifest = first.remediation_manifest;
  if (!plain(manifest) || !sha(manifest.contentDigest) || manifest.contentDigest === sourceCourse.digest ||
      !same(manifest, { courseKey: `${sourceCourse.id}-remediation-${first.id}`, contentDigest: manifest.contentDigest,
        sourceCourseKey: sourceCourse.id, sourceContentDigest: sourceCourse.digest, definitionDigest: definition.digest,
        finalAttemptId: first.id, reviewAttemptId: review.id, moduleIds: ids,
        unitIds: sourceCourse.modules.filter(m => ids.includes(m.id)).flatMap(m => m.units.map(u => u.id)),
        completed: false, retakeEnabled: false })) fail('manifest_history');
  if (!plain(workflow) || workflow.student_id !== actorId || workflow.review_attempt_id !== review.id ||
      workflow.first_final_id !== first.id || workflow.definition_digest !== definition.digest || !same(workflow.manifest, manifest) ||
      !integer(workflow.revision) || workflow.revision < 1 || !plain(workflow.runtime) ||
      !integer(workflow.runtime.revision) || workflow.runtime.revision >= workflow.revision ||
      workflow.runtime.mode !== 'non_credit_review' || workflow.runtime.creditIssuanceAllowed !== false ||
      workflow.runtime.courseKey !== manifest.courseKey || workflow.runtime.contentDigest !== manifest.contentDigest ||
      !['remediating', 'second_issued', 'passed', 'staff_review_required'].includes(workflow.status) ||
      !plain(input.lease) || input.lease.student_id !== actorId) fail('workflow_history');
  const reservedAt = reservationOrigin(input);
  const phase = { version: 'nmls-first-final-phase-v1', actorId, reviewAttemptId: review.id, finalAttemptId: first.id,
    courseKey: sourceCourse.id, contentDigest: sourceCourse.digest, definitionDigest: definition.digest,
    selectionDigest: hash(first.selection), offeringId: binding.offering.id };
  const sealedAt = submissionOrigin(input, { id: manifest.courseKey, digest: manifest.contentDigest }, phase, reservedAt, 'historical');
  const ledger = actorPolicy?.ledger;
  if (!plain(actorPolicy) || actorPolicy.student_id !== actorId || actorPolicy.policy_id !== binding.policy_id ||
      actorPolicy.policy_digest !== binding.policy_digest || !integer(actorPolicy.revision) ||
      actorPolicy.revision < input.submissionEvent.actor_revision || !plain(ledger) || ledger.actorId !== actorId ||
      ledger.policyId !== binding.policy_id || ledger.revision !== actorPolicy.revision || ledger.creditIssuanceAllowed !== false ||
      !instant(ledger.lastReceiptMs) || ledger.lastReceiptMs < input.delivery.runtime.lastReceiptMs) fail('actor_policy');
  return freeze({ phase, notBeforeMs: Math.max(reservedAt, sealedAt, Date.parse(first.issued_at),
    ledger.lastReceiptMs, review.runtime.lastReceiptMs) });
}

export function makeNmlsFirstFinalHandoffContext(input) {
  if (!plain(input)) fail('invalid_context');
  // Existing domain checks the full ordered source payload, definition payload
  // pin, complete original review, actual saved grading result, failed-only
  // manifest, child digest and workflow ownership. It never rewrites a result.
  const child = makeNmlsRemediationTeachingContext(input);
  const { actorId, review, binding, definition, firstFinal: first, actorPolicy } = input;
  if (!date(first.issued_at) || !exact(first.selection,
    ['schema', 'id', 'reviewAttemptId', 'definitionDigest', 'number', 'questionIds', 'optionOrder'])) fail('selection_scope');
  const reservedAt = reservationOrigin(input);
  const phase = { version: 'nmls-first-final-phase-v1', actorId, reviewAttemptId: review.id, finalAttemptId: first.id,
    courseKey: input.sourceCourse.id, contentDigest: input.sourceCourse.digest, definitionDigest: definition.digest,
    selectionDigest: hash(first.selection), offeringId: binding.offering.id };
  const sealedAt = submissionOrigin(input, child.course, phase, reservedAt);
  const ledger = actorPolicy?.ledger;
  if (!plain(actorPolicy) || actorPolicy.student_id !== actorId || actorPolicy.policy_id !== binding.policy_id ||
      actorPolicy.policy_digest !== binding.policy_digest || !integer(actorPolicy.revision) ||
      actorPolicy.revision < input.submissionEvent.actor_revision || !plain(ledger) || ledger.actorId !== actorId ||
      ledger.policyId !== binding.policy_id || ledger.revision !== actorPolicy.revision || ledger.creditIssuanceAllowed !== false ||
      !instant(ledger.lastReceiptMs) || ledger.lastReceiptMs < input.delivery.runtime.lastReceiptMs ||
      !integer(ledger.studySinceBreakMs) || !Array.isArray(ledger.studyIntervals) || !Array.isArray(ledger.acceptances) ||
      ['sessionStartedAtMs', 'lastStudyAtMs', 'studyBoundaryAtMs', 'breakStartedAtMs'].some(k => ledger[k] !== null &&
        (!instant(ledger[k]) || ledger[k] > ledger.lastReceiptMs))) fail('actor_policy');
  validateNmlsUncertainExposure(ledger.uncertainExposure);
  let last = -1;
  for (const interval of ledger.studyIntervals) {
    if (!exact(interval, ['start', 'end']) || !instant(interval.start) || !instant(interval.end) ||
        interval.start < last || interval.end <= interval.start || interval.end > ledger.lastReceiptMs) fail('actor_policy');
    last = interval.end;
  }
  const journal = ledger.observationJournal;
  if (!exact(journal, ['version', 'actorId', 'lastReceiptMs', 'active', 'unresolved', 'creditIssuanceAllowed']) ||
      journal.version !== 'nmls-study-windows-v3-phase' || journal.actorId !== actorId || journal.creditIssuanceAllowed !== false ||
      !instant(journal.lastReceiptMs) || journal.lastReceiptMs < input.delivery.runtime.lastReceiptMs ||
      journal.lastReceiptMs > ledger.lastReceiptMs || journal.active !== null || journal.unresolved !== null) fail('observation_history');
  const handoffPhase = Object.freeze({});
  const result = { handoffPhase, ...child, ledger: structuredClone(ledger) };
  tokens.set(handoffPhase, { teachingPhase: child.teachingPhase, courseHash: hash(child.course), runtimeHash: hash(child.runtime),
    offeringHash: hash(child.offering), ledgerHash: hash(ledger), actorId, attemptId: review.id, finalId: first.id,
    sourceRevision: review.revision, deliveryRevision: input.delivery.revision, actorRevision: actorPolicy.revision,
    sessionId: input.delivery.runtime.sessionId,
    notBeforeMs: Math.max(reservedAt, sealedAt, Date.parse(first.issued_at), ledger.lastReceiptMs, review.runtime.lastReceiptMs) });
  return freeze(result);
}

export function validateNmlsFirstFinalHandoffCommand(command) {
  if (!exact(command, ['kind', 'attemptId', 'finalAttemptId', 'eventId', 'expectedSourceRevision', 'expectedFinalRevision',
    'expectedDeliveryRevision', 'expectedWorkflowRevision', 'expectedRevision', 'expectedActorRevision', 'sessionId']) ||
      command.kind !== 'start_first_remediation' || !uuid(command.attemptId) || !uuid(command.finalAttemptId) ||
      !uuid(command.eventId) || !uuid(command.sessionId) || command.attemptId === command.finalAttemptId ||
      !integer(command.expectedSourceRevision) || command.expectedSourceRevision < 1 || command.expectedFinalRevision !== 2 ||
      !integer(command.expectedDeliveryRevision) || command.expectedDeliveryRevision < 3 || command.expectedWorkflowRevision !== 1 ||
      command.expectedRevision !== 0 || !integer(command.expectedActorRevision) || command.expectedActorRevision < 1) fail('invalid_command');
  return command;
}

export function createNmlsFirstFinalHandoffEvaluator({ newId = randomUUID } = {}) {
  if (typeof newId !== 'function') fail('invalid_factory');
  const evaluate = createNmlsObservedPolicyReviewEvaluator({ runtimeOptions: { newId } });
  return async context => {
    const { handoffPhase, teachingPhase, course, runtime, offering, ledger, evidence } = context;
    const pinned = tokens.get(handoffPhase);
    if (!pinned) fail('untrusted_context');
    const intent = structuredClone(validateNmlsFirstFinalHandoffCommand(context.command));
    if (teachingPhase !== pinned.teachingPhase || hash(course) !== pinned.courseHash || hash(runtime) !== pinned.runtimeHash ||
        hash(offering) !== pinned.offeringHash || hash(ledger) !== pinned.ledgerHash || evidence?.actorId !== pinned.actorId ||
        !instant(evidence.receivedAtMs) || evidence.receivedAtMs < pinned.notBeforeMs) fail('context_changed');
    if (intent.attemptId !== pinned.attemptId || intent.finalAttemptId !== pinned.finalId ||
        intent.expectedSourceRevision !== pinned.sourceRevision || intent.expectedDeliveryRevision !== pinned.deliveryRevision ||
        intent.expectedActorRevision !== pinned.actorRevision || intent.sessionId !== pinned.sessionId) fail('revision_or_session_conflict');
    const command = { kind: 'resume', attemptId: intent.attemptId, eventId: intent.eventId,
      phaseKind: 'remediation', phaseOwnerId: intent.finalAttemptId, expectedSourceRevision: intent.expectedSourceRevision,
      expectedWorkflowRevision: 1, expectedRevision: 0, expectedActorRevision: intent.expectedActorRevision, sessionId: null };
    const result = await evaluate({ teachingPhase, course: structuredClone(course), runtime: structuredClone(runtime), offering: structuredClone(offering),
      ledger: structuredClone(ledger), command, evidence: { actorId: evidence.actorId, receivedAtMs: evidence.receivedAtMs } });
    // The genuine result may say deliveryAllowed while containing no lesson.
    // Keep it intact for independent SQL validation; metadata redaction is the
    // adapter's job. Never turn this into an invented inert/allowed transition.
    if (result.runtime.status === 'active' && (!uuid(result.runtime.sessionId) || result.runtime.sessionId === pinned.sessionId) ||
        result.runtime.current !== null || result.runtime.quiz !== null || result.runtime.feedback !== null ||
        result.runtime.completedReviewMs !== 0 || result.runtime.completedUnitIds.length || result.runtime.passedModuleIds.length ||
        result.runtime.bookmark != null || result.runtime.quizReservation != null ||
        result.ledger.observationJournal.active !== null || result.ledger.observationJournal.unresolved !== null ||
        result.outcome.progress.lessons.length || result.outcome.progress.quiz !== null || result.outcome.progress.feedback !== null ||
        result.audit.policy.observation !== undefined) fail('unexpected_teaching');
    return { command, runtime: result.runtime, ledger: result.ledger, outcome: result.outcome, audit: result.audit };
  };
}
