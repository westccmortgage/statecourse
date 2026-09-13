import { validateNmlsTeachingInput, transactNmlsTeaching } from './nmls-teaching-transaction.mjs';
import { validateNmlsFinalReservationInput, transactNmlsFinalReservation } from './nmls-final-reservation.mjs';
import { validateNmlsFirstFinalDeliveryInput, transactNmlsFirstFinalDelivery } from './nmls-first-final-delivery.mjs';
import { validateNmlsFirstFinalSubmissionInput, transactNmlsFirstFinalSubmission } from './nmls-first-final-submission.mjs';
import { validateNmlsFirstFinalHandoffInput, transactNmlsFirstFinalHandoff } from './nmls-first-final-handoff.mjs';
import { validateNmlsSecondFinalReservationInput, transactNmlsSecondFinalReservation } from './nmls-second-final-reservation.mjs';
import { validateNmlsSecondFinalDeliveryInput, transactNmlsSecondFinalDelivery } from './nmls-second-final-delivery.mjs';
import { validateNmlsSecondFinalSubmissionInput, transactNmlsSecondFinalSubmission } from './nmls-second-final-submission.mjs';
import { getNmlsLearningSnapshot } from './nmls-learning-snapshot.mjs';

// Application routing only. Authentication is supplied separately by the
// server; grant/phase/lease/policy authority remains in the existing joint
// transactions. This does not provision, start, bind, present ROCS or grade.
const plain = value => value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
const uuid = value => typeof value === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value);
const exact = (value, keys) => plain(value) && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
const fail = code => { throw new Error(`nmls_learning_${code}`); };
const routes = Object.freeze({
  teaching: [validateNmlsTeachingInput, transactNmlsTeaching],
  reserve_first_final: [validateNmlsFinalReservationInput, transactNmlsFinalReservation],
  first_final_delivery: [validateNmlsFirstFinalDeliveryInput, transactNmlsFirstFinalDelivery],
  submit_first_final: [validateNmlsFirstFinalSubmissionInput, transactNmlsFirstFinalSubmission],
  handoff_remediation: [validateNmlsFirstFinalHandoffInput, transactNmlsFirstFinalHandoff],
  reserve_second_final: [validateNmlsSecondFinalReservationInput, transactNmlsSecondFinalReservation],
  second_final_delivery: [validateNmlsSecondFinalDeliveryInput, transactNmlsSecondFinalDelivery],
  submit_second_final: [validateNmlsSecondFinalSubmissionInput, transactNmlsSecondFinalSubmission],
});

// Accept JSON data, not executable getters, functions, prototypes, sparse
// arrays or non-finite numbers. Copy before any asynchronous dependency runs.
function requestSnapshot(input) {
  const active = new Set(); let count = 0;
  function copy(value, depth) {
    if (++count > 1000 || depth > 8) fail('invalid_request');
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if ((!plain(value) && !Array.isArray(value)) || active.has(value)) fail('invalid_request');
    if (Array.isArray(value) && value.length > 1000) fail('invalid_request');
    const descriptors = Object.getOwnPropertyDescriptors(value), keys = Reflect.ownKeys(value);
    const expected = Array.isArray(value) ? [...Array.from({ length: value.length }, (_, i) => String(i)), 'length'] : keys;
    if (keys.some(key => typeof key !== 'string') || keys.length !== expected.length || expected.some(key => !Object.hasOwn(descriptors, key))) {
      fail('invalid_request');
    }
    active.add(value);
    const entries = [];
    for (const key of keys) {
      if (Array.isArray(value) && key === 'length') continue;
      const descriptor = descriptors[key];
      if (!Object.hasOwn(descriptor, 'value') || descriptor.enumerable !== true) fail('invalid_request');
      entries.push([key, copy(descriptor.value, depth + 1)]);
    }
    active.delete(value);
    return Array.isArray(value) ? entries.map(([, entry]) => entry) : Object.fromEntries(entries);
  }
  return copy(input, 0);
}

function trustedDependencies(deps) {
  if (!plain(deps) || Reflect.ownKeys(deps).some(key => !['rpc', 'courseFor', 'definitionFor'].includes(key))) fail('invalid_dependencies');
  const result = {};
  for (const key of ['rpc', 'courseFor', 'definitionFor']) {
    const descriptor = Object.getOwnPropertyDescriptor(deps, key);
    if (!descriptor) { if (key === 'rpc') fail('invalid_dependencies'); continue; }
    if (!Object.hasOwn(descriptor, 'value') || typeof descriptor.value !== 'function') fail('invalid_dependencies');
    result[key] = descriptor.value;
  }
  return result;
}

export async function executeNmlsLearningReview(input, studentId, deps = {}) {
  if (!uuid(studentId)) fail('authentication_required');
  const envelope = requestSnapshot(input);
  if (!exact(envelope, ['operation', 'command']) || typeof envelope.operation !== 'string' || !plain(envelope.command)) fail('invalid_request');
  const trusted = trustedDependencies(deps), { operation, command } = envelope;
  if (operation === 'snapshot') {
    if (!exact(command, ['grantId']) || !uuid(command.grantId)) fail('invalid_request');
    const { definitionFor, ...snapshotDeps } = trusted;
    return getNmlsLearningSnapshot(command, studentId, snapshotDeps);
  }
  if (!Object.hasOwn(routes, operation)) fail('invalid_request');
  const [validate, transact] = routes[operation];
  try { validate(command); } catch { fail('invalid_request'); }
  // Return the existing adapter's validated, committed response directly. No
  // additional transport await, projection, grading, redraw or retry follows
  // its final material-horizon check. HTTP must also serialize immediately.
  return transact(command, studentId, trusted);
}

const unauthorized = new Set(['nmls_learning_authentication_required', 'student_auth_required', 'invalid_student_session']);
const invalidRequest = new Set(['nmls_learning_invalid_request', 'nmls_learning_snapshot_invalid_request']);
const accessDenied = new Set([
  'origin_not_allowed',
  'nmls_review_access_denied', 'nmls_final_access_denied', 'nmls_first_final_delivery_access_denied',
  'nmls_first_final_submission_access_denied', 'nmls_first_final_handoff_access_denied',
  'nmls_second_final_access_denied', 'nmls_second_final_delivery_access_denied',
  'nmls_second_final_submission_access_denied', 'nmls_learning_snapshot_access_denied',
]);
const conflicts = new Set([
  'nmls_review_revision_conflict', 'nmls_review_session_conflict', 'nmls_review_idempotency_conflict',
  'nmls_review_content_changed', 'nmls_review_policy_version_conflict', 'nmls_review_policy_binding_required',
  'nmls_review_rocs_document_unverified', 'nmls_review_invalid_rocs_receipt', 'nmls_review_clock_refresh_required',
  'nmls_teaching_original_observation_hold', 'nmls_teaching_completed_phase_requires_reconciliation',
  'nmls_teaching_legacy_lease_requires_reconciliation', 'nmls_teaching_history_requires_reconciliation', 'nmls_teaching_resume_required',
  'nmls_final_history_scope_conflict', 'nmls_final_idempotency_conflict', 'nmls_final_already_issued',
  'nmls_final_revision_conflict', 'nmls_final_review_prerequisites', 'nmls_final_clock_refresh_required',
  'nmls_first_final_delivery_unreserved_form', 'nmls_first_final_delivery_source_incomplete',
  'nmls_first_final_submission_idempotency_conflict', 'nmls_first_final_submission_history_conflict', 'nmls_first_final_submission_already_submitted',
  'nmls_first_final_handoff_idempotency_conflict', 'nmls_first_final_handoff_already_recorded',
  'nmls_first_final_handoff_first_not_failed', 'nmls_first_final_handoff_genesis_required', 'nmls_first_final_handoff_initial_state_required',
  'nmls_second_final_idempotency_conflict', 'nmls_second_final_already_reserved',
  'nmls_second_final_remediation_incomplete', 'nmls_second_final_completion_history_required',
  'nmls_second_final_handoff_required', 'nmls_second_final_content_changed', 'nmls_second_final_definition_changed',
  'nmls_second_final_policy_required', 'nmls_second_final_terminal_history_changed',
  'nmls_second_final_delivery_reservation_required', 'nmls_second_final_delivery_not_reserved',
  'nmls_second_final_submission_idempotency_conflict', 'nmls_second_final_submission_history_conflict', 'nmls_second_final_submission_already_submitted',
  'nmls_learning_snapshot_requires_review',
]);

export function nmlsLearningPublicError(error) {
  // Exact tokens only: raw PostgreSQL messages, embedded codes, SQLSTATEs,
  // details/hints/stack, arbitrary statusCode and future unknown errors remain
  // opaque. A backend message is never an unrestricted public text channel.
  // Missing database/auth/base-URL configuration and unavailable identity
  // services intentionally take the same generic503 path as internal errors.
  const descriptor = error && typeof error === 'object' ? Object.getOwnPropertyDescriptor(error, 'message') : null;
  const code = descriptor && Object.hasOwn(descriptor, 'value') && typeof descriptor.value === 'string' ? descriptor.value : '';
  const status = unauthorized.has(code) ? 401 : invalidRequest.has(code) ? 400 : accessDenied.has(code) ? 403 : conflicts.has(code) ? 409 : 503;
  return { status, body: { error: status === 503 ? 'nmls_learning_unavailable' : code } };
}
