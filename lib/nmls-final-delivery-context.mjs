import { createHash } from 'node:crypto';
import { makeNmlsSourceTeachingContext } from './nmls-teaching-phase.mjs';
import { projectNmlsDraftFinal, requireNmlsFinalReviewCompletion } from './nmls-final-assessment.mjs';

// PRIVATE, prospective domain context. Reconstruct from trusted server-loaded
// rows, never from browser JSON. This proves consistency, not row authenticity,
// current grant validity, identity, attendance, permission to display, or credit.
// SQL must still lock/recheck authority and atomically persist any later phase.
const tokens = new WeakMap();
const plain = x => x !== null && typeof x === 'object' && Object.getPrototypeOf(x) === Object.prototype;
const integer = x => Number.isSafeInteger(x) && x >= 0;
const uuid = x => typeof x === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x);
const sha = x => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
const date = x => typeof x === 'string' && x.trim().length > 0 && Number.isFinite(Date.parse(x));
const stable = x => Array.isArray(x) ? x.map(stable) : plain(x) ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
const same = (a, b) => a !== undefined && b !== undefined && hash(a) === hash(b);
const exact = (x, keys) => plain(x) && Object.keys(x).length === keys.length && keys.every(k => Object.hasOwn(x, k));
const freeze = x => { if (x && typeof x === 'object') { for (const child of Object.values(x)) freeze(child); Object.freeze(x); } return x; };
const fail = code => { throw new Error(`nmls_final_delivery_context_${code}`); };

export function makeNmlsFirstFinalDeliveryContext(input) {
  if (!plain(input)) fail('invalid_input');
  const { actorId, review, binding, sourceCourse, definition, reservedFinal: first,
    reservation: receipt, teachingEvent: event, actorPolicy } = input;
  const source = makeNmlsSourceTeachingContext({ actorId, review, binding, sourceCourse });
  requireNmlsFinalReviewCompletion(definition, source.runtime);
  if (definition.sourcePayloadDigest !== hash(sourceCourse) || definition.courseKey !== sourceCourse.id ||
      definition.contentDigest !== sourceCourse.digest) fail('source_changed');

  //026 has no status column. An unsubmitted first form is represented by
  // revision1 and these explicit NULL fields, not a caller's in_progress flag.
  if (!plain(first) || !uuid(first.id) || first.id === review.id || first.student_id !== actorId ||
      first.review_attempt_id !== review.id || first.course_key !== sourceCourse.id ||
      first.content_digest !== sourceCourse.digest || first.definition_digest !== definition.digest ||
      first.revision !== 1 || !date(first.issued_at) ||
      ['answers', 'result', 'remediation_manifest', 'submitted_at'].some(k => first[k] !== null)) fail('first_not_reserved');
  const selection = first.selection;
  if (!exact(selection, ['schema', 'id', 'reviewAttemptId', 'definitionDigest', 'number', 'questionIds', 'optionOrder']) ||
      selection.id !== first.id || selection.reviewAttemptId !== review.id || selection.number !== 1 ||
      selection.definitionDigest !== definition.digest) fail('selection_scope');
  // Use the actual private bank validator for quotas, IDs and option mapping.
  // The question projection is deliberately discarded, never added to context.
  projectNmlsDraftFinal(definition, selection);
  const selectionDigest = hash(selection);

  if (!plain(receipt) || !plain(event) || !uuid(receipt.event_id) || event.event_id !== receipt.event_id ||
      receipt.student_id !== actorId || event.student_id !== actorId || receipt.review_attempt_id !== review.id ||
      event.review_attempt_id !== review.id || !sha(receipt.command_digest) || event.command_digest !== receipt.command_digest ||
      receipt.definition_digest !== definition.digest || receipt.reserved !== true || receipt.final_id !== first.id ||
      receipt.selection_digest !== selectionDigest || !date(receipt.recorded_at) || !date(event.recorded_at) ||
      event.phase_kind !== 'source' || event.phase_owner_id !== review.id || event.workflow_revision !== null ||
      !integer(receipt.source_revision) || receipt.source_revision < 1 || event.source_revision !== receipt.source_revision ||
      event.runtime_revision !== receipt.source_revision || review.revision < receipt.source_revision ||
      !integer(receipt.actor_revision) || receipt.actor_revision < 1 || event.actor_revision !== receipt.actor_revision ||
      !integer(event.transaction_id) || event.transaction_id < 1) fail('reservation_pair');
  const expectedReceipt = { ok: true, code: 'private_final_reserved', status: 200, reserved: true,
    finalAttemptId: first.id, finalRevision: 1, sourceRevision: receipt.source_revision, actorRevision: receipt.actor_revision,
    mode: 'private_authoring_review', studentDeliveryEnabled: false, creditIssuanceAllowed: false };
  if (!same(receipt.outcome, expectedReceipt)) fail('reservation_outcome');

  // Current actor/source revisions may advance after reservation. They are
  // provenance lower bounds, never fields in stable material/phase identity.
  const ledger = actorPolicy?.ledger;
  if (!plain(actorPolicy) || actorPolicy.student_id !== actorId || actorPolicy.policy_id !== binding.policy_id ||
      actorPolicy.policy_digest !== binding.policy_digest || !integer(actorPolicy.revision) ||
      actorPolicy.revision < receipt.actor_revision || !plain(ledger) || ledger.actorId !== actorId ||
      ledger.policyId !== binding.policy_id || ledger.revision !== actorPolicy.revision ||
      ledger.creditIssuanceAllowed !== false || !integer(ledger.lastReceiptMs)) fail('actor_policy');

  const outcome = event.outcome, audit = event.audit, progress = outcome?.progress;
  if (!plain(outcome) || outcome.ok !== true || outcome.status !== 200 ||
      !['review_policy_checked', 'session_policy_allowed'].includes(outcome.code) ||
      outcome.policyCode !== 'session_policy_allowed' || outcome.observationReady !== true ||
      outcome.observationCode !== 'study_observation_ready' || outcome.deliveryAllowed !== false ||
      outcome.deliveryUntilMs !== null || outcome.studyWindow !== null || outcome.studyRecovery !== null ||
      outcome.teachingPhaseComplete !== true || outcome.actorRevision !== receipt.actor_revision ||
      !plain(progress) || progress.mode !== 'non_credit_review' || progress.creditIssuanceAllowed !== false ||
      progress.courseKey !== sourceCourse.id || progress.contentDigest !== sourceCourse.digest ||
      progress.status !== 'review_complete' || progress.revision !== receipt.source_revision ||
      progress.sessionId !== source.runtime.sessionId || !uuid(progress.sessionId) || progress.currentUnitId !== null ||
      progress.provisionalReviewMs !== 0 || progress.resumeRequired !== false ||
      !same(progress.completedUnitIds, source.runtime.completedUnitIds) || !same(progress.passedModuleIds, source.runtime.passedModuleIds) ||
      progress.completedReviewMs !== source.runtime.completedReviewMs || !same(progress.lessons, []) ||
      progress.quiz !== null || progress.feedback !== null) fail('teaching_outcome');
  if (!plain(audit) || !plain(audit.review) || !plain(audit.policy) || audit.review.kind !== 'check_access' ||
      audit.policy.kind !== 'check_access' || audit.policy.code !== 'session_policy_allowed' ||
      !integer(audit.review.atMs) || audit.policy.atMs !== audit.review.atMs || audit.policy.actorId !== actorId ||
      audit.review.atMs < source.offering.opensAtMs || audit.review.atMs >= source.offering.closesAtMs ||
      audit.policy.offeringId !== binding.offering.id || audit.policy.contentDigest !== sourceCourse.digest ||
      audit.policy.policyId !== binding.policy_id || Object.hasOwn(audit.policy, 'observation') ||
      !same(audit.observation, { reason: 'no_prior_material', code: 'study_observation_ready' }) ||
      review.runtime.lastReceiptMs < audit.review.atMs || ledger.lastReceiptMs < audit.review.atMs) fail('teaching_audit');
  const expectedLease = { student_id: actorId, attempt_id: review.id, session_id: progress.sessionId,
    phase_kind: 'source', phase_owner_id: review.id, phase_active: false };
  if (!same(event.lease_before, expectedLease) || !same(event.lease_after, expectedLease)) fail('reservation_lease');

  const scope = Object.freeze({ version: 'nmls-first-final-phase-v1', actorId, reviewAttemptId: review.id,
    finalAttemptId: first.id, courseKey: sourceCourse.id, contentDigest: sourceCourse.digest,
    definitionDigest: definition.digest, selectionDigest, offeringId: binding.offering.id });
  const finalPhase = Object.freeze({ scope });
  const result = { finalPhase, definition: structuredClone(definition), selection: structuredClone(selection),
    sourceRuntime: structuredClone(source.runtime), offering: structuredClone(source.offering) };
  tokens.set(finalPhase, { actorId, definitionHash: hash(result.definition), selectionHash: selectionDigest,
    offeringHash: hash(result.offering), ledgerHash: hash(ledger), actorRevision: actorPolicy.revision,
    notBeforeMs: Math.max(ledger.lastReceiptMs, audit.review.atMs, Date.parse(first.issued_at),
      Date.parse(event.recorded_at), Date.parse(receipt.recorded_at)) });
  // sourceRuntime is not an assert argument. Freeze its detached snapshot so
  // consumers cannot accidentally replace validated source completion in place.
  return freeze(result);
}

export function nmlsFinalDeliveryScope(finalPhase) {
  if (!tokens.has(finalPhase)) fail('untrusted_phase');
  return finalPhase.scope;
}

export function assertNmlsFinalDeliveryPhase(finalPhase, context) {
  const pinned = tokens.get(finalPhase);
  if (!pinned) fail('untrusted_phase');
  if (!plain(context) || context.actorId !== pinned.actorId || !plain(context.definition) ||
      !plain(context.selection) || !plain(context.offering) || hash(context.definition) !== pinned.definitionHash ||
      hash(context.selection) !== pinned.selectionHash || hash(context.offering) !== pinned.offeringHash ||
      !plain(context.ledger) || context.ledger.revision !== pinned.actorRevision || hash(context.ledger) !== pinned.ledgerHash ||
      !integer(context.receivedAtMs) || context.receivedAtMs > 8.64e15 || context.receivedAtMs < pinned.notBeforeMs) fail('context_changed');
  return finalPhase.scope;
}
