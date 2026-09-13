import { createHash, randomUUID } from 'node:crypto';
import { createNmlsPolicyReviewEvaluator } from './nmls-policy-review.mjs';
import { projectNmlsReview } from './nmls-review-runtime.mjs';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { addNmlsRecoveryDebit } from './nmls-uncertain-exposure.mjs';
import { assertNmlsTeachingPhase, nmlsTeachingPhaseScope } from './nmls-teaching-phase.mjs';

// Internal, deliberately NOT connected to HTTP. This journal travels inside
// the actor ledger in the existing dual-CAS transaction. Never save it before
// committing the associated runtime/policy result. Signals are not attendance
// or identity proof. Recovery requires a clear-before-request client protocol;
// the existing learner page does NOT implement it. No production wiring.
const VERSION = 'nmls-study-windows-v2';
const PHASE_VERSION = 'nmls-study-windows-v3-phase';
const uuid = s => typeof s === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(s);
const instant = n => Number.isSafeInteger(n) && n >= 0 && n <= 8.64e15;
const exact = (o, keys) => o && typeof o === 'object' && !Array.isArray(o) &&
  Object.keys(o).length === keys.length && keys.every(k => Object.hasOwn(o, k));
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ?
  Object.fromEntries(Object.keys(value).sort().map(k => [k, stable(value[k])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(stable(value))).digest('hex');
const fail = () => { throw new Error('invalid_study_observation_state'); };
const hasMaterial = p => p.lessons.length > 0 || p.quiz != null || p.feedback != null;

export function validateNmlsStudyReceipt(receipt) {
  if (!exact(receipt, ['windowId', 'visible']) || !uuid(receipt.windowId) || typeof receipt.visible !== 'boolean') {
    throw new Error('invalid_study_receipt');
  }
  return receipt;
}

function scopeOf(c, runtime = c.runtime) {
  return { actorId: c.evidence.actorId, attemptId: c.command.attemptId, offeringId: c.offering.id,
    contentDigest: c.course.digest, sessionId: runtime.sessionId,
    ...(c.teachingPhase !== undefined ? { teachingPhase: nmlsTeachingPhaseScope(c.teachingPhase) } : {}) };
}

function materialOf(runtime, projection) {
  return hash({ lessonIds: projection.lessons.map(x => x.id), unitAttemptId: runtime.current?.attemptId ?? null,
    quizId: runtime.quiz?.id ?? null, questionIds: runtime.quiz?.questionIds ?? [], feedback: projection.feedback });
}

function validateWindow(w, actorId, phaseAware = false) {
  if (!exact(w, ['id', 'scope', 'materialDigest', 'runtimeRevision', 'openingEventId', 'issuedAtMs', 'horizonMs', 'lastObservedAtMs']) ||
      !uuid(w.id) || !uuid(w.openingEventId) || !exact(w.scope, ['actorId', 'attemptId', 'offeringId', 'contentDigest', 'sessionId', ...(phaseAware ? ['teachingPhase'] : [])]) ||
      w.scope.actorId !== actorId || !uuid(w.scope.attemptId) || !uuid(w.scope.offeringId) || !uuid(w.scope.sessionId) ||
      !/^[a-f0-9]{64}$/.test(w.scope.contentDigest) || !/^[a-f0-9]{64}$/.test(w.materialDigest) ||
      !Number.isSafeInteger(w.runtimeRevision) || w.runtimeRevision < 0 || !instant(w.issuedAtMs) || !instant(w.horizonMs) ||
      w.horizonMs <= w.issuedAtMs || (w.lastObservedAtMs !== null &&
        (!instant(w.lastObservedAtMs) || w.lastObservedAtMs < w.issuedAtMs || w.lastObservedAtMs > w.horizonMs))) fail();
  if (phaseAware) {
    const p = w.scope.teachingPhase, digest = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
    if (!exact(p, ['version', 'kind', 'ownerId', 'sourceCourseKey', 'sourceContentDigest', 'teachingCourseKey', 'policyDigest', 'definitionDigest', 'manifestDigest']) ||
        p.version !== 'nmls-teaching-phase-v1' || !['source', 'remediation'].includes(p.kind) || !uuid(p.ownerId) ||
        !digest(p.sourceContentDigest) || !digest(p.policyDigest) ||
        !['sourceCourseKey', 'teachingCourseKey'].every(k => typeof p[k] === 'string' && p[k].length > 0) ||
        (p.kind === 'source' ? p.ownerId !== w.scope.attemptId || p.sourceContentDigest !== w.scope.contentDigest ||
          p.sourceCourseKey !== p.teachingCourseKey || p.definitionDigest !== null || p.manifestDigest !== null :
          p.ownerId === w.scope.attemptId || !digest(p.definitionDigest) || !digest(p.manifestDigest))) fail();
  }
}

function journalFor(c) {
  const prior = c.ledger.observationJournal;
  const phaseAware = c.teachingPhase !== undefined, version = phaseAware ? PHASE_VERSION : VERSION;
  if (prior === undefined) {
    // Do not silently upgrade an already-instructed attempt whose historical
    // windows were never captured by this collector.
    if (phaseAware && nmlsTeachingPhaseScope(c.teachingPhase).kind !== 'source' || c.ledger.revision !== 0 || c.runtime.revision !== 0 ||
        hasMaterial(projectNmlsReview(c.runtime, c.course)) || c.runtime.bookmark || c.runtime.quizReservation ||
        c.runtime.completedReviewMs > 0 || c.runtime.passedModuleIds.length || c.ledger.studyIntervals.length ||
        c.ledger.studySinceBreakMs > 0 || c.ledger.uncertainExposure.intervals.length ||
        c.ledger.uncertainExposure.lastBoundaryMs !== null) {
      throw new Error('study_observation_bootstrap_requires_clean_attempt');
    }
    return { version, actorId: c.evidence.actorId, lastReceiptMs: 0, active: null, unresolved: null,
      creditIssuanceAllowed: false };
  }
  if (!exact(prior, ['version', 'actorId', 'lastReceiptMs', 'active', 'unresolved', 'creditIssuanceAllowed']) ||
      prior.version !== version || prior.actorId !== c.evidence.actorId || !instant(prior.lastReceiptMs) ||
      prior.creditIssuanceAllowed !== false || (prior.active !== null && prior.unresolved !== null)) fail();
  if (prior.active !== null) validateWindow(prior.active, prior.actorId, phaseAware);
  if (prior.unresolved !== null) {
    if (!exact(prior.unresolved, ['window', 'reason', 'detectedAtMs', 'eventId']) ||
        typeof prior.unresolved.reason !== 'string' || !instant(prior.unresolved.detectedAtMs) || !uuid(prior.unresolved.eventId)) fail();
    validateWindow(prior.unresolved.window, prior.actorId, phaseAware);
    if (prior.unresolved.detectedAtMs < prior.unresolved.window.issuedAtMs ||
        prior.unresolved.detectedAtMs > prior.lastReceiptMs) fail();
  }
  return structuredClone(prior);
}

function interrupt(journal, window, reason, c) {
  journal.active = null;
  journal.unresolved = { window: structuredClone(window), reason,
    detectedAtMs: c.evidence.receivedAtMs, eventId: c.command.eventId };
  return { journal, ready: false, code: reason, recovery: recoveryFor(c, journal.unresolved),
    audit: { reason, unresolved: structuredClone(journal.unresolved) } };
}

function recoveryFor(c, unresolved) {
  const w = unresolved.window, current = scopeOf(c);
  // Recovery may use a newly acquired lease; it must not relabel historical
  // evidence to a different attempt, offering, actor, or manuscript version.
  const originalScope = ['actorId', 'attemptId', 'offeringId', 'contentDigest'].every(k => w.scope[k] === current[k]) &&
    hash(w.scope.teachingPhase ?? null) === hash(current.teachingPhase ?? null);
  if (!originalScope) return { code: 'study_recovery_original_scope_required', eligibleAtMs: null };
  if (w.issuedAtMs < c.offering.opensAtMs || w.horizonMs > c.offering.closesAtMs) fail();
  // State/settlement inconsistencies need review, not an accounting shortcut.
  if (!['study_receipt_missing_or_stale', 'study_visibility_interrupted', 'study_horizon_expired',
    'study_receipt_gap', 'study_scope_interrupted'].includes(unresolved.reason)) {
    return { code: 'study_recovery_review_required', eligibleAtMs: null };
  }
  // The next explicit, content-clearing recovery request can resolve the gap.
  // Eligibility is NOT permission to teach and never proves cached text was
  // unread. Budget through that request, not merely through the old horizon.
  return { code: 'study_recovery_eligible', eligibleAtMs: unresolved.detectedAtMs };
}

function receive(c) {
  const journal = journalFor(c), at = c.evidence.receivedAtMs;
  if (!instant(at) || at < journal.lastReceiptMs || !uuid(c.command.eventId) || !uuid(c.command.attemptId)) fail();
  journal.lastReceiptMs = at;
  if (c.command.studyReceipt !== undefined) validateNmlsStudyReceipt(c.command.studyReceipt);
  if (c.command.kind === 'recover_observation' && (!uuid(c.command.recoveryWindowId) ||
      c.command.studyReceipt !== undefined || c.command.recoveryWindowId !== journal.unresolved?.window.id)) {
    throw new Error('study_recovery_window_conflict');
  }
  if (journal.unresolved) {
    const recovery = recoveryFor(c, journal.unresolved);
    return { journal, ready: false, recovery,
      code: c.command.kind === 'recover_observation' ? recovery.code : 'study_observation_unresolved',
      audit: { reason: 'unresolved_preserved' } };
  }
  const w = journal.active, receipt = c.command.studyReceipt;
  if (!w) {
    if (receipt) throw new Error('study_receipt_without_window');
    return { journal, ready: true, code: 'study_observation_ready', audit: { reason: 'no_prior_material' } };
  }
  if (hash(w.scope) !== hash(scopeOf(c))) return interrupt(journal, w, 'study_scope_interrupted', c);
  if (w.runtimeRevision !== c.runtime.revision || w.materialDigest !== materialOf(c.runtime, projectNmlsReview(c.runtime, c.course))) {
    return interrupt(journal, w, 'study_material_interrupted', c);
  }
  if (!receipt || receipt.windowId !== w.id) return interrupt(journal, w, 'study_receipt_missing_or_stale', c);
  if (!receipt.visible || c.command.visible === false) return interrupt(journal, w, 'study_visibility_interrupted', c);
  if (at > w.horizonMs) return interrupt(journal, w, 'study_horizon_expired', c);
  if (w.lastObservedAtMs !== null && at - w.lastObservedAtMs > P.maximumObservationMs) {
    return interrupt(journal, w, 'study_receipt_gap', c);
  }
  const start = w.lastObservedAtMs;
  // First receipt adds restriction-only exposure, never observed study. The
  // original window remains in audit; no fabricated acknowledgment backdate.
  const audit = { windowBefore: structuredClone(w), firstAcknowledgment: start === null,
    signal: 'authenticated_material_receipt_not_identity_proof' };
  if (start === null) audit.initialExposure = { method: 'initial_material_gap_restriction_only_v1',
    windowId: w.id, debitStartMs: w.issuedAtMs, debitEndMs: at, observedStudyAddedMs: 0, creditAddedMs: 0 };
  w.lastObservedAtMs = at;
  return { journal, ready: true, code: start === null ? 'study_material_acknowledged' : 'study_receipt_continuous', audit,
    ...(start === null ? { initialExposure: { start: w.issuedAtMs, end: at } } : {}),
    ...(start !== null && at > start ? { studyInterval: { start, end: at } } : {}) };
}

export function createNmlsObservedPolicyReviewEvaluator({ newWindowId = randomUUID, runtimeOptions = {} } = {}) {
  if (typeof newWindowId !== 'function') throw new Error('invalid_study_window_factory');
  return async c => {
    if (c.teachingPhase !== undefined) assertNmlsTeachingPhase(c.teachingPhase, c);
    const at = c.evidence.receivedAtMs;
    // Existing SQL permits only revision/receipt and lease cleanup outside the
    // annual window. Preserve any old unresolved/current window byte-for-byte;
    // a request for a different offering cannot settle it under a new deadline.
    const outside = at < c.offering.opensAtMs || at >= c.offering.closesAtMs;
    const continuityScope = { actorId: c.evidence.actorId, attemptId: c.teachingPhase !== undefined ?
      nmlsTeachingPhaseScope(c.teachingPhase).ownerId : c.command.attemptId,
      offeringId: c.offering.id, courseKey: c.course.id, contentDigest: c.course.digest };
    let decision;
    const evaluate = createNmlsPolicyReviewEvaluator({ runtimeOptions, continuityScope, observe: () => {
      if (outside) return { ready: false };
      decision = receive(c);
      return { ready: decision.ready, ...(decision.studyInterval ? { studyInterval: decision.studyInterval } : {}),
        ...(decision.initialExposure ? { initialExposure: decision.initialExposure } : {}) };
    } });
    let result = await evaluate(c);
    if (outside) {
      result.outcome.observationCode = 'outside_window_no_settlement'; result.outcome.studyWindow = null;
      result.outcome.studyRecovery = null;
      result.audit.observation = { reason: 'outside_window_preserved' }; return result;
    }
    let journal = decision.journal;
    if (c.command.kind === 'recover_observation') {
      const authorized = result.audit.policy.code === 'recovery_context_allowed' &&
        result.outcome.status !== 401 && c.runtime.current === null && c.runtime.quiz === null &&
        c.runtime.feedback === null && journal.active === null;
      if (authorized && decision.recovery.code === 'study_recovery_eligible') {
        const window = journal.unresolved.window;
        const debitStartMs = window.lastObservedAtMs ?? window.issuedAtMs;
        const debit = addNmlsRecoveryDebit(result.ledger, debitStartMs, at);
        result.ledger = debit.state;
        decision.audit.recovery = { method: 'conservative_gap_debit_no_study_awarded',
          original: structuredClone(journal.unresolved), ...decision.recovery,
          debitStartMs, debitEndMs: at, resumeNotBeforeMs: debit.resumeNotBeforeMs,
          clientProtocolRequired: 'clear-before-recovery-v1',
          recoveredAtMs: at, eventId: c.command.eventId, observedStudyAddedMs: 0, creditAddedMs: 0 };
        journal.unresolved = null;
        decision.code = 'study_observation_recovered';
        result.outcome.ok = true; result.outcome.status = 200; result.outcome.code = decision.code;
        result.outcome.resumeNotBeforeMs = debit.resumeNotBeforeMs;
      } else if (authorized) {
        result.outcome.code = decision.code;
      } else if (result.outcome.status !== 401) {
        decision.code = 'study_recovery_context_denied'; result.outcome.code = decision.code;
      }
      // Always content-free. A fresh full pause and the normal daily/session
      // limits precede new material; no observation or progress is fabricated.
    }
    const observedAudit = result.audit.policy.observation;
    if (decision.studyInterval && observedAudit?.code !== 'study_interval_recorded' && observedAudit?.observedOutsidePolicy !== true) {
      // No consumption when the policy reducer rejected settlement. Redo the
      // pure composition without instruction and retain the pre-receipt window.
      decision = interrupt(journal, decision.audit.windowBefore, 'study_settlement_rejected', c);
      result = await createNmlsPolicyReviewEvaluator({ runtimeOptions, continuityScope, observe: () => ({ ready: false }) })(c);
    }
    const projection = result.outcome.progress;
    if (result.outcome.deliveryAllowed && hasMaterial(projection)) {
      const horizon = result.deliveryUntilMs;
      if (!instant(horizon) || horizon <= at || horizon - at > P.maximumObservationMs) fail();
      const scope = scopeOf(c, result.runtime), materialDigest = materialOf(result.runtime, projection);
      const old = journal.active;
      if (old && hash(old.scope) === hash(scope) && old.materialDigest === materialDigest) {
        old.horizonMs = horizon; old.runtimeRevision = result.runtime.revision;
      } else {
        if (old) decision.audit.closedWindow = structuredClone(old);
        journal.active = { id: newWindowId(), scope, materialDigest, runtimeRevision: result.runtime.revision,
          openingEventId: c.command.eventId, issuedAtMs: at, horizonMs: horizon, lastObservedAtMs: null };
      }
      validateWindow(journal.active, c.evidence.actorId, c.teachingPhase !== undefined);
    } else if (journal.active) {
      decision.audit.closedWindow = structuredClone(journal.active); journal.active = null;
    }
    result.ledger.observationJournal = journal;
    result.outcome.observationCode = decision.code;
    result.outcome.studyWindow = journal.active ? { id: journal.active.id, expiresAtMs: journal.active.horizonMs } : null;
    result.outcome.studyRecovery = journal.unresolved && decision.recovery?.eligibleAtMs != null ?
      { windowId: journal.unresolved.window.id, eligibleAtMs: decision.recovery.eligibleAtMs } : null;
    result.audit.observation = { ...decision.audit, code: decision.code,
      ...(journal.active ? { windowAfter: structuredClone(journal.active) } : {}) };
    return result;
  };
}
