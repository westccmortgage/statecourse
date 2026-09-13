import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { emptyNmlsUncertainExposure, validateNmlsUncertainExposure, nmlsRestrictionUsage,
  unionNmlsExposureIntervals, nmlsExposureInRange } from './nmls-uncertain-exposure.mjs';

// SERVER DOMAIN COMPONENT, not an HTTP endpoint or an approval/credit gate.
// Load one actor-wide ledger transactionally, not one per course, grant or tab.
// Caller must verify identity/lease, serialize CAS/idempotency and atomically
// persist this ledger, attempt changes and audit. Internal SQL/transport exists;
// the production engagement evaluator and learner HTTP/UI are not connected.
// An allowed result only permits this policy check; it NEVER awards seat time.
const fail = (code) => { throw new Error(code); };
const text = (s) => typeof s === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/.test(s);
const sha = (s) => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s);
const instant = (t) => Number.isSafeInteger(t) && t >= 0 && t <= 8.64e15;
const fields = (obj, allowed) => obj && typeof obj === 'object' && !Array.isArray(obj) &&
  Object.keys(obj).every(k => allowed.includes(k));

export function validateNmlsAnnualWindow(offering) {
  if (!offering || !text(offering.id) || !sha(offering.contentDigest) ||
      !Number.isSafeInteger(offering.year) || offering.year < 2026 || offering.year > 2100 ||
      offering.educationType !== 'annual_ce' || !text(offering.deadlineBasisId) ||
      !instant(offering.opensAtMs) || !instant(offering.closesAtMs) || offering.closesAtMs <= offering.opensAtMs ||
      typeof offering.timeZone !== 'string' || !offering.timeZone) fail('invalid_annual_delivery_window');
  let yearAt;
  try {
    const format = new Intl.DateTimeFormat('en-US', { timeZone: offering.timeZone, year: 'numeric', calendar: 'gregory' });
    yearAt = (at) => Number(format.formatToParts(new Date(at)).find(p => p.type === 'year').value);
    if (yearAt(offering.opensAtMs) !== offering.year || yearAt(offering.closesAtMs - 1) !== offering.year) fail('invalid_annual_delivery_window');
  } catch { fail('invalid_annual_delivery_window'); }
  return true;
}

export function startNmlsSessionPolicy(actorId) {
  if (!text(actorId)) fail('invalid_policy_actor');
  return { policyId: P.id, actorId, revision: 0, lastReceiptMs: 0,
    sessionStartedAtMs: null, lastStudyAtMs: null, studyBoundaryAtMs: null, breakStartedAtMs: null, studySinceBreakMs: 0,
    studyIntervals: [], uncertainExposure: emptyNmlsUncertainExposure(), acceptances: [], creditIssuanceAllowed: false };
}

function policyStep(previous, command, offering, evidence) {
  validateNmlsAnnualWindow(offering);
  if (!previous || previous.policyId !== P.id || previous.creditIssuanceAllowed !== false) fail('policy_state_version_mismatch');
  validateNmlsUncertainExposure(previous.uncertainExposure);
  // Server adapter must construct evidence; no browser-supplied clocks/actors.
  if (!evidence || evidence.actorId !== previous.actorId || !instant(evidence.receivedAtMs) ||
      evidence.receivedAtMs < previous.lastReceiptMs) fail('invalid_policy_server_evidence');
  const at = evidence.receivedAtMs;
  const keys = {
    accept_rocs: ['kind', 'expectedRevision', 'version', 'documentDigest', 'acknowledged'],
    open_session: ['kind', 'expectedRevision'], begin_break: ['kind', 'expectedRevision'],
    end_break: ['kind', 'expectedRevision'], check_access: ['kind', 'expectedRevision'],
    check_recovery: ['kind', 'expectedRevision'],
    observe_study: ['kind', 'expectedRevision'],
  };
  if (!command || !Object.hasOwn(keys, command.kind) || !fields(command, keys[command.kind])) fail('invalid_policy_command');
  if (command.expectedRevision !== previous.revision) fail('policy_revision_conflict');
  const state = structuredClone(previous);
  const result = (ok, code, extra = {}) => {
    return { ok, code, state, ...extra, creditIssuanceAllowed: false,
      audit: { kind: command.kind, code, atMs: at, actorId: state.actorId,
        offeringId: offering.id, contentDigest: offering.contentDigest, policyId: P.id } };
  };
  // Refuse the full operation at/exceeding cutoff: never backdate completion.
  // Banking grace is intentionally absent. Late CE needs a different offering.
  if (at < offering.opensAtMs) return result(false, 'delivery_not_open');
  if (at >= offering.closesAtMs) return result(false, 'delivery_window_closed');
  const document = offering.rocs;
  if (!document || document.version !== P.rocsVersion || !sha(document.documentDigest) ||
      document.fullDocumentVerified !== true || !text(document.evidenceId)) return result(false, 'rocs_document_unverified');
  const accepted = state.acceptances.find(a => a.offeringId === offering.id && a.contentDigest === offering.contentDigest &&
    a.documentDigest === document.documentDigest && a.version === document.version);
  if (command.kind === 'accept_rocs') {
    if (command.acknowledged !== true || command.version !== document.version ||
        command.documentDigest !== document.documentDigest) return result(false, 'rocs_acknowledgment_required');
    if (accepted) return result(true, 'rocs_already_accepted');
    // A server-issued presentation receipt binds the displayed full document
    // to this offering/actor. A checkbox or unverified external URL alone is
    // not a substitute. Rendering/accessibility and receipt persistence are
    // obligations of the future adapter, not proved by this domain function.
    const presentation = evidence.presentation;
    if (!presentation || presentation.actorId !== state.actorId || presentation.offeringId !== offering.id ||
        presentation.contentDigest !== offering.contentDigest || presentation.documentDigest !== document.documentDigest ||
        !text(presentation.id) || !instant(presentation.presentedAtMs) || presentation.presentedAtMs > at ||
        presentation.presentedAtMs < offering.opensAtMs) return result(false, 'rocs_presentation_required');
    state.acceptances.push({ offeringId: offering.id, contentDigest: offering.contentDigest,
      version: document.version, documentDigest: document.documentDigest,
      acceptedAtMs: at, evidenceId: document.evidenceId, actorId: state.actorId,
      presentationId: presentation.id, presentedAtMs: presentation.presentedAtMs,
      retentionYears: P.rocsRetentionYears });
    // Keep the full immutable receipt in durable audit, not just its version.
    const r = result(true, 'rocs_accepted'); r.audit.receipt = structuredClone(state.acceptances.at(-1)); return r;
  }
  if (!accepted) return result(false, 'rocs_required');
  // Content-free authorization check only. Retiring an interrupted window is
  // the observer's separate responsibility; this neither clears a hold nor
  // resets/prunes observed usage, accepts ROCS, or opens a study session.
  if (command.kind === 'check_recovery') return result(true, 'recovery_context_allowed');
  if (command.kind === 'begin_break') {
    // A repeat click cannot move the break start or remove rolling usage.
    if (state.breakStartedAtMs === null) state.breakStartedAtMs = at;
    return result(true, 'break_started', { resumeNotBeforeMs: state.breakStartedAtMs + P.minimumBreakMs });
  }
  if (command.kind === 'end_break') {
    if (state.breakStartedAtMs === null) return result(false, 'break_not_started');
    if (at - state.breakStartedAtMs < P.minimumBreakMs) return result(false, 'break_incomplete', {
      resumeNotBeforeMs: state.breakStartedAtMs + P.minimumBreakMs });
    state.breakStartedAtMs = null; state.studySinceBreakMs = 0; state.studyBoundaryAtMs = at;
    // Breaks do not reset the wall-session limit or rolling24h usage.
    return result(true, 'break_completed');
  }
  if (state.breakStartedAtMs !== null) return result(false, 'break_in_progress', {
    resumeNotBeforeMs: state.breakStartedAtMs + P.minimumBreakMs });
  if (command.kind === 'open_session') {
    // An explicit new session is permitted only after a12h rest since the last
    // observed or conservatively budgeted exposure. This is provider policy, not an NMLS
    // mandated rest duration. A page reload alone never resets these counters.
    if (state.sessionStartedAtMs === null) { state.sessionStartedAtMs = at; state.lastStudyAtMs = at; state.studyBoundaryAtMs = at; }
    else if (at - state.sessionStartedAtMs >= P.sessionWallLimitMs &&
        at - nmlsRestrictionUsage(state, at).latestPossibleExposureMs >= P.minimumNewSessionRestMs) {
      state.sessionStartedAtMs = at; state.studySinceBreakMs = 0; state.studyBoundaryAtMs = at;
    }
  }
  if (state.sessionStartedAtMs === null) return result(false, 'session_required');
  if (at - state.sessionStartedAtMs >= P.sessionWallLimitMs) return result(false, 'session_wall_limit');
  // Prune for rolling usage only. The adapter must retain audit history5years.
  state.studyIntervals = state.studyIntervals.filter(i => i.end > at - P.rollingWindowMs - P.maximumObservationMs);
  state.uncertainExposure.intervals = state.uncertainExposure.intervals.filter(i => i.end > at - P.rollingWindowMs - P.maximumObservationMs);
  const usage = nmlsRestrictionUsage(state, at);
  if (command.kind !== 'observe_study') {
    if (usage.sinceBreakMs >= P.breakAfterStudyMs) return result(false, 'mandatory_break_required');
    const dailyUsed = usage.rollingMs;
    if (dailyUsed >= P.rollingStudyLimitMs) return result(false, 'rolling_study_limit');
    // Adapter must stop delivery at this horizon, not wait for the next poll.
    return result(true, 'session_policy_allowed', { maxNextStudyMs: Math.min(P.maximumObservationMs,
      P.breakAfterStudyMs - usage.sinceBreakMs, P.rollingStudyLimitMs - dailyUsed,
      state.sessionStartedAtMs + P.sessionWallLimitMs - at, offering.closesAtMs - at) });
  }

  // Evidence comes from server-observed engagement intervals, INCLUDING quiz
  // time, repeated/invalidated units and all this actor's course offerings. It
  // is not the narrower set of minutes that will eventually qualify for credit.
  const interval = evidence.studyInterval;
  if (!interval || !fields(interval, ['start', 'end']) || !instant(interval.start) || !instant(interval.end) ||
      interval.end !== at || interval.end <= interval.start || interval.end - interval.start > P.maximumObservationMs ||
      interval.start < state.lastStudyAtMs || interval.start < state.studyBoundaryAtMs ||
      interval.start < offering.opensAtMs || interval.start < accepted.acceptedAtMs) return result(false, 'invalid_study_interval');
  const elapsed = interval.end - interval.start;
  const crossesBreak = nmlsRestrictionUsage(state, interval.start).sinceBreakMs + elapsed > P.breakAfterStudyMs;
  // Evaluate at start as well: a rolling boundary cannot authorize an interval
  // that had already exceeded the limit earlier within that interval.
  const crossesRolling = nmlsExposureInRange(unionNmlsExposureIntervals(state.studyIntervals,
    state.uncertainExposure.intervals, [interval]), interval.start - P.rollingWindowMs, at) > P.rollingStudyLimitMs;
  const last = state.studyIntervals.at(-1);
  if (last && interval.start < last.end) return result(false, 'overlapping_study_interval');
  if (last && interval.start === last.end) last.end = interval.end;
  else state.studyIntervals.push({ start: interval.start, end: interval.end });
  state.studySinceBreakMs += elapsed;
  state.lastStudyAtMs = at;
  // Actual observed exposure does not disappear when it violated a horizon.
  // Persist the counters + refusal atomically; never interpret observedStudyMs
  // as awarded credit. The resulting block survives the next check_access.
  if (crossesBreak || crossesRolling) {
    const r = result(false, crossesBreak ? 'mandatory_break_required' : 'rolling_study_limit', { observedStudyMs: elapsed });
    r.audit.observedOutsidePolicy = true; r.audit.observedStudyMs = elapsed; return r;
  }
  return result(true, 'study_interval_recorded', { observedStudyMs: elapsed });
}

// One committed actor transition may settle an independently validated study
// observation AND process a control. Internal steps never advance revision or
// receipt; the single finalizer does so exactly once, including on a refusal.
// This is not an observation collector: studyInterval remains server evidence.
export function applyNmlsSessionPolicy(previous, command, offering, evidence) {
  // Validate the requested intent even if its preceding observation is refused.
  // policyStep is pure, so this preflight cannot accept ROCS or reset counters.
  const preflight = policyStep(previous, command, offering, evidence);
  let result = preflight;
  if (command.kind !== 'observe_study' && evidence.studyInterval != null) {
    const observed = policyStep(previous, { kind: 'observe_study', expectedRevision: previous.revision }, offering, evidence);
    result = observed.ok ? policyStep(observed.state, command, offering, evidence) : observed;
    result.audit = { ...result.audit, observation: observed.audit };
    result.observedStudyMs = observed.observedStudyMs ?? 0;
  }
  result.state.revision = previous.revision + 1;
  result.state.lastReceiptMs = evidence.receivedAtMs;
  return result;
}
