import { createHash } from 'node:crypto';
import { NMLS_SESSION_POLICY as P } from '../config/nmls/session-policy.mjs';
import { validateNmlsAnnualWindow } from './nmls-session-policy.mjs';
import { gradeNmlsDraftFinal, makeNmlsFinalRemediationCourse, requireNmlsFinalReviewCompletion } from './nmls-final-assessment.mjs';
import { validateNmlsCurrentUnit, validateNmlsReviewContinuity } from './nmls-review-continuity.mjs';

// Prospective SERVER DOMAIN context, NOT a grant, identity check, database
// transaction or HTTP input. Rebuild from authenticated, locked source rows.
// Never deserialize a token or replace an original offering with a child digest.
const tokens = new WeakMap();
const uuid = s => typeof s === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(s);
const plain = x => x !== null && typeof x === 'object' && Object.getPrototypeOf(x) === Object.prototype;
const integer = n => Number.isSafeInteger(n) && n >= 0;
const stable = x => Array.isArray(x) ? x.map(stable) : plain(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
const same = (a, b) => hash(a) === hash(b);
const fail = code => { throw new Error(`nmls_teaching_phase_${code}`); };

function runtimeShape(r, course) {
  if (!plain(r) || r.mode !== 'non_credit_review' || r.creditIssuanceAllowed !== false ||
      r.courseKey !== course.id || r.contentDigest !== course.digest || !integer(r.revision) ||
      !['logged_out', 'active', 'review_complete'].includes(r.status) || !integer(r.lastReceiptMs) ||
      !integer(r.completedReviewMs) || !(r.lastActivityMs === null || integer(r.lastActivityMs)) ||
      !(r.sessionId === null || uuid(r.sessionId)) ||
      ['current', 'quiz', 'feedback'].some(k => r[k] !== null && !plain(r[k])) ||
      ['bookmark', 'quizReservation'].some(k => Object.hasOwn(r, k) && r[k] !== null && !plain(r[k]))) fail('runtime_shape');
  for (const [key, values] of [['completedUnitIds', course.modules.flatMap(m => m.units.map(u => u.id))],
    ['passedModuleIds', course.modules.map(m => m.id)]]) {
    if (!Array.isArray(r[key]) || new Set(r[key]).size !== r[key].length || r[key].some(id => !values.includes(id))) fail('runtime_shape');
  }
  if (r.status === 'active' && (!uuid(r.sessionId) || !integer(r.lastActivityMs)) ||
      r.lastActivityMs !== null && r.lastActivityMs > r.lastReceiptMs) fail('runtime_shape');
  const units = course.modules.flatMap(m => m.units);
  if (!same(r.completedUnitIds, units.slice(0, r.completedUnitIds.length).map(u => u.id)) ||
      !same(r.passedModuleIds, course.modules.slice(0, r.passedModuleIds.length).map(m => m.id)) ||
      r.completedReviewMs !== units.filter(u => r.completedUnitIds.includes(u.id)).reduce((n, u) => n + u.requiredSeconds * 1000, 0) ||
      course.modules.some((m, i) => i < r.passedModuleIds.length && m.units.some(u => !r.completedUnitIds.includes(u.id)) ||
        i > r.passedModuleIds.length && m.units.some(u => r.completedUnitIds.includes(u.id)))) fail('runtime_progress');
  if (r.status === 'review_complete' && (r.completedUnitIds.length !== units.length ||
      r.passedModuleIds.length !== course.modules.length || r.current !== null || r.quiz !== null ||
      r.bookmark != null || r.quizReservation != null)) fail('runtime_completion');
  if (r.status !== 'review_complete' && r.passedModuleIds.length === course.modules.length) fail('runtime_completion');
  if (r.status === 'logged_out' && (r.sessionId !== null || r.current !== null || r.quiz !== null)) fail('runtime_shape');
  if (r.current !== null) {
    if (r.status !== 'active' || r.quiz !== null || r.current.sessionId !== r.sessionId) fail('runtime_shape');
    validateNmlsCurrentUnit(r, course, r.current, r.lastReceiptMs);
  }
}

function source(input) {
  const { actorId, review, sourceCourse: course, binding } = input;
  if (!uuid(actorId) || !plain(review) || !uuid(review.id) || review.student_id !== actorId ||
      !uuid(review.grant_id) || !plain(binding) || binding.grant_id !== review.grant_id ||
      binding.offering?.id !== review.grant_id) fail('authority');
  if (binding.policy_id !== P.id || binding.policy_digest !== hash(P)) fail('policy_version');
  if (!plain(course) || review.course_key !== course.id || review.content_digest !== course.digest ||
      binding.offering.contentDigest !== course.digest) fail('source_changed');
  // Both existing private source loaders hash their ordered JSON payload before
  // adding digest. Recheck those actual bytes, not just matching digest labels.
  const { digest: expected, ...payload } = course;
  if (createHash('sha256').update(JSON.stringify(payload)).digest('hex') !== expected) fail('source_changed');
  validateNmlsAnnualWindow(binding.offering);
  runtimeShape(review.runtime, course);
  if (!integer(review.revision) || review.revision !== review.runtime.revision) fail('source_revision');
  return { actorId, review, course, offering: binding.offering, policyDigest: binding.policy_digest };
}

function seal(s, course, runtime, teaching, workflowRevision, notBeforeMs = 0) {
  validateNmlsReviewContinuity(runtime, course, { scope: { actorId: s.actorId, attemptId: teaching.ownerId,
    offeringId: s.offering.id, courseKey: course.id, contentDigest: course.digest },
    saveAllowed: false, restoreAllowed: false }, runtime.lastReceiptMs);
  const scope = Object.freeze({ version: 'nmls-teaching-phase-v1', ...teaching,
    sourceCourseKey: s.course.id, sourceContentDigest: s.course.digest,
    teachingCourseKey: course.id, policyDigest: s.policyDigest });
  const token = Object.freeze({ scope, sourceRevision: s.review.revision, workflowRevision });
  tokens.set(token, { actorId: s.actorId, attemptId: s.review.id, offeringId: s.offering.id,
    courseHash: hash(course), runtimeHash: hash(runtime), offeringHash: hash(s.offering), notBeforeMs });
  return { teachingPhase: token, course, runtime: structuredClone(runtime), offering: structuredClone(s.offering) };
}

export function makeNmlsSourceTeachingContext(input) {
  const s = source(input);
  return seal(s, s.course, s.review.runtime, { kind: 'source', ownerId: s.review.id,
    definitionDigest: null, manifestDigest: null }, null);
}

export function makeNmlsRemediationTeachingContext(input) {
  const s = source(input), { definition, firstFinal: first, workflow } = input;
  if (!plain(first) || !uuid(first.id) || first.id === s.review.id || first.student_id !== s.actorId || first.review_attempt_id !== s.review.id ||
      first.revision !== 2 || first.selection?.number !== 1 || first.selection?.id !== first.id ||
      first.selection?.reviewAttemptId !== s.review.id || typeof first.submitted_at !== 'string' ||
      !first.submitted_at.trim() || !Number.isFinite(Date.parse(first.submitted_at))) fail('first_not_sealed');
  if (first.course_key !== s.course.id || first.content_digest !== s.course.digest ||
      definition?.courseKey !== s.course.id || definition.contentDigest !== s.course.digest ||
      definition.sourcePayloadDigest !== hash(s.course) || first.definition_digest !== definition.digest) fail('source_changed');
  if (s.review.revision < 1 || s.review.runtime.current !== null || s.review.runtime.quiz !== null ||
      s.review.runtime.bookmark != null || s.review.runtime.quizReservation != null) fail('source_incomplete');
  requireNmlsFinalReviewCompletion(definition, s.review.runtime);
  const result = gradeNmlsDraftFinal(definition, first.selection, first.answers);
  if (!same(result, first.result) || result.passed) fail('first_result');
  const child = makeNmlsFinalRemediationCourse(definition, s.course, first.selection, first.answers);
  const manifest = { courseKey: child.id, contentDigest: child.digest,
    sourceCourseKey: s.course.id, sourceContentDigest: s.course.digest, definitionDigest: definition.digest,
    finalAttemptId: first.id, reviewAttemptId: s.review.id, moduleIds: child.modules.map(m => m.id),
    unitIds: child.modules.flatMap(m => m.units.map(u => u.id)), completed: false, retakeEnabled: false };
  if (!plain(first.remediation_manifest) || !same(manifest, first.remediation_manifest)) fail('manifest_changed');
  if (!plain(workflow) || workflow.student_id !== s.actorId || workflow.review_attempt_id !== s.review.id ||
      workflow.first_final_id !== first.id || workflow.definition_digest !== definition.digest ||
      !plain(workflow.manifest) || !same(manifest, workflow.manifest) || workflow.status !== 'remediating' ||
      !integer(workflow.revision) || workflow.revision < 1 ||
      ['second_id', 'second_selection', 'second_answers', 'second_result', 'second_issued_at', 'second_submitted_at']
        .some(k => workflow[k] !== null)) fail('workflow_scope');
  runtimeShape(workflow.runtime, child);
  if (workflow.runtime.revision >= workflow.revision) fail('workflow_revision');
  return seal(s, child, workflow.runtime, { kind: 'remediation', ownerId: first.id,
    definitionDigest: definition.digest, manifestDigest: hash(manifest) }, workflow.revision, Date.parse(first.submitted_at));
}

export function assertNmlsTeachingPhase(token, context) {
  const pinned = tokens.get(token);
  if (!pinned) fail('untrusted_context');
  const { command, course, runtime, offering, evidence } = context;
  if (evidence.actorId !== pinned.actorId || command.attemptId !== pinned.attemptId || offering.id !== pinned.offeringId ||
      hash(course) !== pinned.courseHash || hash(runtime) !== pinned.runtimeHash ||
      hash(offering) !== pinned.offeringHash || evidence.receivedAtMs < pinned.notBeforeMs) fail('context_changed');
  if (command.expectedSourceRevision !== token.sourceRevision || command.expectedWorkflowRevision !== token.workflowRevision) fail('revision_conflict');
  return token.scope;
}

export function nmlsTeachingPhaseScope(token) {
  if (!tokens.has(token)) fail('untrusted_context');
  return token.scope;
}
