import { NMLS_OSS_REQUIREMENTS as R, NMLS_OSS_DESIGN as D } from '../config/nmls/oss-policy.mjs';

// Pure unit-attempt domain logic. No HTTP adapter, credential verification or
// persistent cross-device lease is implied. The caller must load/persist this
// state transactionally and construct serverEvidence from validated activity,
// never pass JSON supplied by a browser as serverEvidence. All output remains
// non-credit review evidence until the separate enrollment/release chain exists.
export function startNmlsUnitReview({ sessionId, attemptId, unit, receivedAtMs }) {
  const text = (value) => typeof value === 'string' && value.trim().length > 0;
  if (!text(sessionId) || !text(attemptId) || !text(unit?.id) || !Number.isSafeInteger(unit.requiredSeconds) || !Number.isSafeInteger(unit.requiredSeconds * 1000) || unit.requiredSeconds < 1 ||
      !Array.isArray(unit.requiredActionIds) || !unit.requiredActionIds.length ||
      !unit.requiredActionIds.every(text) ||
      new Set(unit.requiredActionIds).size !== unit.requiredActionIds.length ||
      !Number.isSafeInteger(receivedAtMs) || receivedAtMs < 0) throw new Error('invalid_unit_review_input');
  return {
    mode: 'non_credit_review', creditIssuanceAllowed: false, sessionId, attemptId,
    unitId: unit.id, requiredMs: unit.requiredSeconds * 1000, requiredActionIds: [...unit.requiredActionIds],
    completedActionIds: [], status: 'active', provisionalMs: 0, completedMs: 0,
    openedAtMs: receivedAtMs, lastReceiptMs: receivedAtMs, lastActivityMs: receivedAtMs,
    previousEngaged: false, revision: 0, processedEventIds: [], audit: [],
  };
}

export function applyNmlsUnitReviewEvent(previous, event, serverEvidence) {
  const state = structuredClone(previous);
  const reject = (code) => ({ ok: false, code, state });
  if (!event || !serverEvidence || !Number.isSafeInteger(serverEvidence.receivedAtMs)) return reject('server_receipt_required');
  const now = serverEvidence.receivedAtMs;
  if (event.sessionId !== state.sessionId || event.attemptId !== state.attemptId) return reject('attempt_or_session_mismatch');
  if (now < state.lastReceiptMs) return reject('non_monotonic_server_receipt');
  if (state.status === 'active' && now - state.lastActivityMs >= R.idleLogoutMs) {
    state.audit.push({ kind: 'idle_logout', atMs: now, invalidatedMs: state.provisionalMs });
    state.provisionalMs = 0;
    state.completedActionIds = [];
    state.previousEngaged = false;
    state.status = 'logged_out';
    state.lastReceiptMs = now;
    state.revision += 1;
    // Persist this expiry even if the attempted request is rejected.
    return reject('course_logout_required');
  }
  if (state.status === 'completed' && typeof event.id === 'string' && state.processedEventIds.includes(event.id)) return { ok: true, duplicate: true, state };
  if (state.status !== 'active') return reject(state.status === 'completed' ? 'unit_already_completed' : 'course_logout_required');
  if (typeof event.id !== 'string' || !event.id || event.id.length > 128) return reject('event_id_required');
  if (state.processedEventIds.includes(event.id)) return { ok: true, duplicate: true, state };
  if (event.expectedRevision !== state.revision) return reject('stale_event_revision');
  if (!['activity', 'heartbeat', 'verify_action', 'observe_answer', 'complete', 'logout'].includes(event.kind)) return reject('unknown_event_kind');
  if (event.kind === 'observe_answer' && serverEvidence.answerObserved !== true) return reject('answer_observation_required');
  if (event.kind === 'verify_action' && (!state.requiredActionIds.includes(event.actionId) || serverEvidence.verifiedActionId !== event.actionId)) return reject('action_evidence_required');
  if (event.kind === 'complete' && (state.provisionalMs < state.requiredMs || !state.requiredActionIds.every((id) => state.completedActionIds.includes(id)))) return reject('unit_requirements_unmet');

  const delta = now - state.lastReceiptMs;
  const engaged = ['activity', 'heartbeat'].includes(event.kind) && serverEvidence.engagementValidated === true && serverEvidence.visible === true;
  let awardedMs = 0;
  if (engaged && state.previousEngaged && delta <= D.maxCreditableEventGapMs) {
    awardedMs = Math.min(delta, state.requiredMs - state.provisionalMs);
    state.provisionalMs += awardedMs;
  }
  // Automatic polling may continue a visible interval, but is never human
  // activity for the six-minute clock. The HTTP adapter documents the separate
  // client-observed activity signal; it is not BioSig identity verification.
  if ((engaged && event.kind === 'activity') || ['verify_action', 'observe_answer'].includes(event.kind)) state.lastActivityMs = now;
  state.previousEngaged = engaged;
  state.lastReceiptMs = now;
  if (event.kind === 'verify_action' && !state.completedActionIds.includes(event.actionId)) state.completedActionIds.push(event.actionId);
  if (event.kind === 'complete') {
    state.status = 'completed'; state.completedMs = state.provisionalMs; state.provisionalMs = 0;
  }
  if (event.kind === 'logout') {
    // Provider policy: intentional exit also starts a fresh current-unit attempt;
    // completed earlier units are held in a separate course-level ledger.
    state.audit.push({ kind: 'voluntary_exit_invalidation', atMs: now, invalidatedMs: state.provisionalMs });
    state.status = 'logged_out'; state.provisionalMs = 0; state.completedActionIds = [];
  }
  state.processedEventIds.push(event.id);
  state.revision += 1;
  state.audit.push({ eventId: event.id, kind: event.kind, atMs: now, awardedMs, revision: state.revision });
  return { ok: true, duplicate: false, state };
}
