import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';
import { createNmlsSecondFinalDeliveryEvaluator, validateNmlsSecondFinalDeliveryCommand,
  nmlsSecondFinalDeliveryScope } from './nmls-second-final-delivery.mjs';
import { gradeNmlsDraftFinal } from './nmls-final-assessment.mjs';
import { unionNmlsExposureIntervals, nmlsExposureInRange } from './nmls-uncertain-exposure.mjs';

// PRIVATE PURE PROPOSAL ONLY. This closes the actual final session candidate
// and proposes one terminal second result. A second failure requires staff
// review; neither branch creates another remediation child or automatic form.
// It does not persist a submission, authenticate grants/leases, release material or issue
// credit. A joint writer must commit all of it atomically before any result is
// returned, and adjudicate replay/CAS before invoking this evaluator again.
const plain = value => value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
const exact = (value, keys) => plain(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const integer = value => Number.isSafeInteger(value) && value >= 0;
const instant = value => integer(value) && value <= 8.64e15;
const canonical = value => Array.isArray(value) ? value.map(canonical) : plain(value) ?
  Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const hash = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const same = (a, b) => a !== undefined && b !== undefined && hash(a) === hash(b);
const fail = code => { throw new Error(`nmls_second_final_submission_${code}`); };

function pauseFor(command) {
  const { answers, ...closing } = command;
  return { ...closing, kind: 'pause' };
}

export function validateNmlsSecondFinalSubmissionCommand(command, selection) {
  const keys = ['kind', 'eventId', 'expectedRevision', 'expectedActorRevision', 'sessionId', 'answers'];
  if (plain(command) && Object.hasOwn(command, 'studyReceipt')) keys.push('studyReceipt');
  if (!exact(command, keys) || command.kind !== 'submit_second_final') fail('invalid_command');
  // The saved selection, not an arbitrary25 IDs or displayed option positions,
  // determines the exact answer set. This validation never computes a grade.
  const ids = selection?.questionIds;
  if (!plain(selection) || selection.number !== 2 || !Array.isArray(ids) || ids.length !== 25 || new Set(ids).size !== 25 ||
      ids.some(id => typeof id !== 'string' || !/^N26-FIN-[FENG]\d{2}$/.test(id))) fail('invalid_selection');
  if (!exact(command.answers, ids) || Object.values(command.answers).some(choice => !['A', 'B', 'C', 'D'].includes(choice))) {
    fail('invalid_answers');
  }
  validateNmlsSecondFinalDeliveryCommand(pauseFor(command));
  return command;
}

function sameAcknowledgedSession(context, closing, phase) {
  const { runtime, ledger, command, evidence } = context;
  const w = ledger.observationJournal.active, after = closing.ledger.observationJournal;
  const at = evidence.receivedAtMs;
  return runtime.status === 'active' && runtime.sessionId !== null && plain(w) &&
    ledger.observationJournal.unresolved === null && instant(w.lastObservedAtMs) &&
    same(w.scope, { actorId: phase.actorId, attemptId: phase.reviewAttemptId, offeringId: phase.offeringId,
      contentDigest: phase.contentDigest, sessionId: runtime.sessionId, finalPhase: phase }) &&
    w.materialDigest === phase.selectionDigest && w.runtimeRevision === runtime.revision &&
    command.sessionId === runtime.sessionId && command.studyReceipt?.windowId === w.id && command.studyReceipt.visible === true &&
    closing.runtime.status === 'paused' && closing.runtime.sessionId === runtime.sessionId &&
    closing.runtime.lastActivityMs === runtime.lastActivityMs && after.active === null && after.unresolved === null &&
    closing.outcome.candidateMaterialAllowed === false && closing.outcome.candidateUntilMs === null && closing.outcome.candidateWindow === null &&
    closing.audit.observation.firstAcknowledgment === false && same(closing.audit.observation.windowBefore, w) &&
    same(closing.audit.observation.closedWindow, { ...w, lastObservedAtMs: at });
}

function exposureEligible(context, closing) {
  const { runtime, ledger: before, offering, evidence } = context, at = evidence.receivedAtMs;
  const w = before.observationJournal.active, ledger = closing.ledger;
  if (!instant(at) || !instant(w.horizonMs) || at >= w.horizonMs ||
      !instant(runtime.lastActivityMs) || at >= runtime.lastActivityMs + R.idleLogoutMs ||
      !instant(ledger.sessionStartedAtMs) || at >= ledger.sessionStartedAtMs + P.sessionWallLimitMs ||
      at < offering.opensAtMs || at >= offering.closesAtMs || ledger.breakStartedAtMs !== null ||
      !integer(ledger.studySinceBreakMs) || ledger.studyBoundaryAtMs !== null &&
        (!instant(ledger.studyBoundaryAtMs) || ledger.studyBoundaryAtMs > at)) return false;
  // The ordinary policy scalar is not sufficient for terminal grading. Even
  // an owner-loaded underreport cannot override retained observed intervals.
  try {
    const observed = unionNmlsExposureIntervals(ledger.studyIntervals);
    const combined = unionNmlsExposureIntervals(observed, ledger.uncertainExposure.intervals);
    if (combined.some(interval => interval.end > at)) return false;
    const boundary = ledger.studyBoundaryAtMs ?? at;
    const observedSinceBreak = nmlsExposureInRange(observed, boundary, at);
    const uncertainOnly = nmlsExposureInRange(combined, boundary, at) - observedSinceBreak;
    const sinceBreak = Math.max(ledger.studySinceBreakMs, observedSinceBreak) + uncertainOnly;
    const rolling = nmlsExposureInRange(combined, at - P.rollingWindowMs, at);
    return Number.isSafeInteger(sinceBreak) && sinceBreak < P.breakAfterStudyMs &&
      Number.isSafeInteger(rolling) && rolling < P.rollingStudyLimitMs;
  } catch { return false; }
}

export function createNmlsSecondFinalSubmissionEvaluator({ grade = gradeNmlsDraftFinal } = {}) {
  if (typeof grade !== 'function') fail('invalid_factory');
  const close = createNmlsSecondFinalDeliveryEvaluator();
  return context => {
    if (!plain(context)) fail('invalid_context');
    const { finalPhase, definition, selection, sourceCourse } = context;
    const command = structuredClone(validateNmlsSecondFinalSubmissionCommand(context.command, selection));
    if (!plain(sourceCourse) || sourceCourse.id !== definition?.courseKey || sourceCourse.digest !== definition?.contentDigest ||
        hash(sourceCourse) !== definition?.sourcePayloadDigest) fail('source_changed');
    const pauseCommand = pauseFor(command);
    const closing = close({ ...context, command: pauseCommand });
    const phase = nmlsSecondFinalDeliveryScope(finalPhase);
    const denied = code => ({ command: pauseCommand, closing, submission: {
      submitted: false, code, answers: null, result: null, terminalStatus: null } });
    if (closing.outcome.ok !== true || closing.outcome.status !== 200 || closing.outcome.code !== 'final_paused' ||
        closing.outcome.policyCode !== 'session_policy_allowed' || closing.outcome.observationCode !== 'receipt_continuous') {
      return denied('second_final_policy_refused');
    }
    const checked = { ...context, command };
    if (!sameAcknowledgedSession(checked, closing, phase)) return denied('second_final_session_required');
    if (!exposureEligible(checked, closing)) return denied('second_final_exposure_review_required');

    // Only an eligible closing candidate may reach grading. A dependency may
    // not replace the pinned grade or mutate authoritative inputs. One immutable terminal
    // submission is a persistence invariant; this calculation never creates
    // a third form or another remediation workflow.
    const expected = gradeNmlsDraftFinal(definition, selection, command.answers);
    const result = grade === gradeNmlsDraftFinal ? expected : grade(
      structuredClone(definition), structuredClone(selection), structuredClone(command.answers));
    if (!plain(result) || !isDeepStrictEqual(result, expected)) fail('grade_changed');
    return { command: pauseCommand, closing, submission: { submitted: true, code: 'second_final_submission_allowed',
      answers: structuredClone(command.answers), result: structuredClone(result),
      terminalStatus: result.passed ? 'passed' : 'staff_review_required' } };
  };
}
