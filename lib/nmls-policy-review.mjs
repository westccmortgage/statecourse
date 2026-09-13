import { applyNmlsSessionPolicy } from './nmls-session-policy.mjs';
import { reduceNmlsReview } from './nmls-review-runtime.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';
import { addNmlsInitialExposureDebit } from './nmls-uncertain-exposure.mjs';
import { assertNmlsTeachingPhase } from './nmls-teaching-phase.mjs';

const controls = new Set(['accept_rocs', 'begin_break', 'end_break', 'recover_observation']);
const deniedWindow = new Set(['delivery_not_open', 'delivery_window_closed', 'rocs_document_unverified']);
// These are expected teaching feedback, not access/protocol denials. A wrong
// formative answer must not remove its explanation or lock the learner out.
const teachingFeedback = new Set(['review_answer_incorrect', 'module_review_retry', 'unit_requirements_unmet']);
const cleanStopCodes = new Set(['session_policy_allowed', 'mandatory_break_required', 'rolling_study_limit', 'session_wall_limit']);

// SERVER-ONLY composition. No endpoint, enrollment, credit or observation
// collector is connected here. `observe` must be a reviewed server adapter
// that derives an interval from durable, lease-bound observations, not from
// client time/earnedMs, unit-credit totals or the possession of a permit alone.
// Missing/unready observation support permits only the content-free controls.
export function createNmlsPolicyReviewEvaluator({ observe = null, runtimeOptions = {}, continuityScope = null } = {}) {
  if (observe !== null && typeof observe !== 'function') throw new Error('invalid_policy_observer');
  return async context => {
    const { command, course, runtime, ledger, offering, evidence, teachingPhase } = context;
    const at = evidence.receivedAtMs;
    if (command.expectedActorRevision !== ledger.revision) throw new Error('policy_revision_conflict');
    if (command.expectedRevision !== runtime.revision) throw new Error('nmls_review_revision_conflict');
    if (command.kind !== 'resume' && command.sessionId !== runtime.sessionId) throw new Error('nmls_review_session_conflict');
    if (ledger.actorId !== evidence.actorId) throw new Error('invalid_policy_server_evidence');
    if (teachingPhase !== undefined) assertNmlsTeachingPhase(teachingPhase, context);
    else if (offering.contentDigest !== course.digest) throw new Error('invalid_policy_server_evidence');

    const idle = runtime.status === 'active' && at - runtime.lastActivityMs >= R.idleLogoutMs;
    // An idle acceptance/break/resume request must first persist logout. It
    // cannot simultaneously accept a document or reset the actor's counters.
    const recoveryControl = command.kind === 'recover_observation';
    const policyKind = idle ? 'check_access' : recoveryControl ? 'check_recovery' : command.kind === 'resume' ? 'open_session' :
      controls.has(command.kind) ? command.kind : 'check_access';
    const policyCommand = { kind: policyKind, expectedRevision: ledger.revision };
    if (policyKind === 'accept_rocs') Object.assign(policyCommand, {
      version: command.version, documentDigest: command.documentDigest, acknowledged: command.acknowledged,
    });
    // Work on clones: an adapter cannot mutate either durable input in place.
    const observation = observe ? await observe(structuredClone({ command, course, runtime, ledger, offering,
      evidence: { actorId: evidence.actorId, receivedAtMs: at } })) : null;
    if (observation != null && (typeof observation !== 'object' || Array.isArray(observation) ||
        Object.keys(observation).some(k => !['ready', 'studyInterval', 'initialExposure'].includes(k)) ||
        typeof observation.ready !== 'boolean' || (!observation.ready && (observation.studyInterval != null || observation.initialExposure != null)) ||
        observation.studyInterval != null && observation.initialExposure != null)) {
      throw new Error('invalid_policy_observation');
    }
    let accountedLedger = ledger;
    if (observation?.initialExposure != null) {
      const gap = observation.initialExposure;
      if (!gap || typeof gap !== 'object' || Array.isArray(gap) || Object.keys(gap).length !== 2 ||
          !Object.hasOwn(gap, 'start') || !Object.hasOwn(gap, 'end') || gap.end !== at ||
          at < offering.opensAtMs || at >= offering.closesAtMs || gap.start < offering.opensAtMs) {
        throw new Error('invalid_initial_exposure');
      }
      accountedLedger = addNmlsInitialExposureDebit(ledger, gap.start, gap.end);
    }
    // Debit before evaluating limits, controls, rest or the next horizon. It
    // never becomes a studyInterval or changes the instructional-time reducer.
    const policy = applyNmlsSessionPolicy(accountedLedger, policyCommand, offering, {
      actorId: evidence.actorId, receivedAtMs: at, presentation: evidence.presentation,
      ...(observation?.studyInterval ? { studyInterval: observation.studyInterval } : {}),
    });
    const canStudy = observation?.ready === true && policy.ok && policy.code === 'session_policy_allowed';
    // Bootstrap/recovery may rotate a content-free lease inside the verified
    // annual window. This avoids a ROCS chicken-and-egg deadlock and lets the
    // learner reach break controls. It never resets actor usage by itself.
    const resumeControl = command.kind === 'resume' && !idle && !deniedWindow.has(policy.code);
    const logoutControl = command.kind === 'logout';
    const policyOnly = controls.has(command.kind);
    const reason = recoveryControl ? 'study_recovery_observer_required' : !policy.ok ? policy.code : !observation?.ready && !policyOnly ?
      'study_observation_not_connected' : policy.code;
    const stop = !canStudy || policyOnly;
    // Server-only scope, provided by the durable observer, never command JSON.
    // A timely clean stop may save work; denied/uncertain/idle delivery may not.
    const cleanSettlement = !observation?.studyInterval || policy.audit.observation?.code === 'study_interval_recorded';
    const continuity = continuityScope ? { scope: continuityScope,
      saveAllowed: !idle && observation?.ready === true && cleanSettlement &&
        (['logout', 'resume'].includes(command.kind) && cleanStopCodes.has(policy.code) ||
          command.kind === 'begin_break' && policy.ok && policy.code === 'break_started'),
      restoreAllowed: canStudy && command.kind === 'resume' } : null;
    let review = reduceNmlsReview(runtime, command, course, at, { ...runtimeOptions,
      initialMaterialAcknowledgment: observation?.initialExposure != null,
      continuity,
      policyCheck: command.kind === 'check_access',
      policyControl: stop && !resumeControl && !logoutControl ? {
        ok: policyOnly && policy.ok && !recoveryControl, code: reason,
        status: policyOnly && policy.ok && !recoveryControl ? 200 : 409,
        logout: deniedWindow.has(policy.code),
      } : null,
    });
    if (canStudy && !policyOnly && !logoutControl && !review.outcome.ok &&
        review.outcome.status !== 401 && !teachingFeedback.has(review.outcome.code)) {
      // Discard the pure tentative result; commit only the content-free denial
      // once. Malformed/out-of-sequence requests cannot renew cached material
      // or bridge their stopped-delivery interval into the next unit heartbeat.
      review = reduceNmlsReview(runtime, command, course, at, { ...runtimeOptions,
        initialMaterialAcknowledgment: observation?.initialExposure != null,
        continuity: continuity ? { ...continuity, saveAllowed: false, restoreAllowed: false } : null, policyControl: {
        ok: false, code: review.outcome.code, status: review.outcome.status,
      } });
    }
    const deliveryAllowed = canStudy && !policyOnly && !logoutControl &&
      (review.state.status === 'active' || teachingPhase === undefined && review.state.status === 'review_complete') &&
      (review.outcome.ok || teachingFeedback.has(review.outcome.code));
    const idleDeadline = review.state.lastActivityMs + R.idleLogoutMs;
    const deliveryUntilMs = deliveryAllowed ? Math.min(at + policy.maxNextStudyMs, idleDeadline) : null;
    const outcome = { ...review.outcome, actorRevision: policy.state.revision, policyCode: policy.code,
      observationReady: observation?.ready === true, deliveryAllowed, deliveryUntilMs,
      ...(policy.resumeNotBeforeMs != null ? { resumeNotBeforeMs: policy.resumeNotBeforeMs } : {}) };
    // Prospective phase path: completion retains progress but never keeps a
    // lesson window open after its teaching phase. Legacy SQL025 cannot commit
    // this distinct terminal transition; no existing adapter is switched over.
    if (teachingPhase !== undefined) outcome.teachingPhaseComplete = review.state.status === 'review_complete';
    if (!deliveryAllowed) { outcome.progress.lessons = []; outcome.progress.quiz = null; outcome.progress.feedback = null; }
    return { ledger: policy.state, runtime: review.state, outcome, deliveryUntilMs,
      audit: { review: review.audit, policy: policy.audit } };
  };
}
