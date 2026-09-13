import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';

// Restriction-only accounting. These intervals are NOT observed engagement,
// attendance, unit duration or credit. Original windows/events stay in audit.
const VERSION = 'nmls-uncertain-exposure-v1';
const instant = n => Number.isSafeInteger(n) && n >= 0 && n <= 8.64e15;
const fail = () => { throw new Error('invalid_uncertain_exposure_budget'); };

export function emptyNmlsUncertainExposure() {
  return { version: VERSION, intervals: [], lastBoundaryMs: null };
}

export function validateNmlsUncertainExposure(value) {
  if (!value || Array.isArray(value) || Object.keys(value).length !== 3 || value.version !== VERSION ||
      !Array.isArray(value.intervals) || (value.lastBoundaryMs !== null && !instant(value.lastBoundaryMs))) fail();
  let previousEnd = -1;
  for (const i of value.intervals) {
    if (!i || Object.keys(i).length !== 2 || !instant(i.start) || !instant(i.end) || i.end <= i.start ||
        i.start <= previousEnd || value.lastBoundaryMs === null || i.end > value.lastBoundaryMs) fail();
    previousEnd = i.end;
  }
  return value;
}

export function unionNmlsExposureIntervals(...groups) {
  const merged = [];
  for (const i of groups.flat().map(i => ({ start: i.start, end: i.end })).sort((a, b) => a.start - b.start)) {
    if (!instant(i.start) || !instant(i.end) || i.end <= i.start) fail();
    const last = merged.at(-1);
    if (last && i.start <= last.end) last.end = Math.max(last.end, i.end);
    else merged.push(i);
  }
  return merged;
}

export function nmlsExposureInRange(intervals, start, end) {
  return intervals.reduce((sum, i) => sum + Math.max(0, Math.min(i.end, end) - Math.max(i.start, start)), 0);
}

export function nmlsRestrictionUsage(ledger, at) {
  const uncertain = validateNmlsUncertainExposure(ledger.uncertainExposure);
  const combined = unionNmlsExposureIntervals(ledger.studyIntervals, uncertain.intervals);
  const boundary = ledger.studyBoundaryAtMs ?? at;
  const uncertainOnlySinceBreak = nmlsExposureInRange(combined, boundary, at) -
    nmlsExposureInRange(unionNmlsExposureIntervals(ledger.studyIntervals), boundary, at);
  return { rollingMs: nmlsExposureInRange(combined, at - P.rollingWindowMs, at),
    sinceBreakMs: ledger.studySinceBreakMs + uncertainOnlySinceBreak,
    latestPossibleExposureMs: Math.max(ledger.lastStudyAtMs ?? 0, uncertain.lastBoundaryMs ?? 0) };
}

export function addNmlsRecoveryDebit(ledger, start, end) {
  const previous = validateNmlsUncertainExposure(ledger.uncertainExposure);
  if (!instant(start) || !instant(end) || end < start ||
      end < (previous.lastBoundaryMs ?? 0) || !instant(end + P.minimumBreakMs)) fail();
  const state = structuredClone(ledger);
  state.uncertainExposure = { version: VERSION,
    intervals: unionNmlsExposureIntervals(previous.intervals, end > start ? [{ start, end }] : []), lastBoundaryMs: end };
  // A break started/completed during unresolved exposure cannot wash it away.
  // This is a new content-free provider pause, not an assertion of human rest.
  state.breakStartedAtMs = end;
  return { state, resumeNotBeforeMs: end + P.minimumBreakMs };
}

// A timely first receipt cannot establish when the material was first read.
// Budget its short delivery gap for restrictions ONLY, without imposing the
// recovery pause used for an interrupted/unknown window. Caller derives these
// bounds from the durable window, never from browser-supplied elapsed time.
export function addNmlsInitialExposureDebit(ledger, start, end) {
  const previous = validateNmlsUncertainExposure(ledger.uncertainExposure);
  if (!instant(start) || !instant(end) || end < start || end - start > P.maximumObservationMs ||
      start !== ledger.lastReceiptMs || (previous.lastBoundaryMs !== null && end < previous.lastBoundaryMs)) {
    throw new Error('invalid_initial_exposure');
  }
  const state = structuredClone(ledger);
  state.uncertainExposure = { version: VERSION,
    intervals: unionNmlsExposureIntervals(previous.intervals, start < end ? [{ start, end }] : []),
    lastBoundaryMs: end };
  return state;
}
