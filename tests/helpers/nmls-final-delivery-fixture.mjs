import { createHash, randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { getNmlsReviewCourse } from '../../netlify/functions/_lib/nmls-review-content.mjs';
import { NMLS_SESSION_POLICY as P } from '../../config/nmls/session-policy.mjs';
import { makeNmlsSourceTeachingContext } from '../../lib/nmls-teaching-phase.mjs';
import { createNmlsObservedPolicyReviewEvaluator } from '../../lib/nmls-study-observer.mjs';
import { startNmlsSessionPolicy } from '../../lib/nmls-session-policy.mjs';
import { startNmlsCourseReview } from '../../lib/nmls-review-runtime.mjs';
import { defineNmlsDraftFinal, drawNmlsDraftFinal } from '../../lib/nmls-final-assessment.mjs';

// Pure, SYNTHETIC one-unit/20-second source, artificial clock, invented ROCS
// evidence and database-row-shaped reservation receipts. Completion and the
// check_access outcome use actual reducers. The receipt pair is NOT SQL-backed
// or proof of a transaction, identity, attendance, regulatory timing or credit.
const stable = x => Array.isArray(x) ? x.map(stable) : x && typeof x === 'object' ?
  Object.fromEntries(Object.keys(x).sort().map(k => [k, stable(x[k])])) : x;
const hash = x => createHash('sha256').update(JSON.stringify(stable(x))).digest('hex');
const freeze = x => { if (x && typeof x === 'object') { for (const y of Object.values(x)) freeze(y); Object.freeze(x); } return x; };
const course = structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
course.id = 'synthetic-final-delivery-context';
course.modules[0].units = [{ ...course.modules[0].units[0], requiredSeconds: 20 }];
delete course.digest; course.digest = createHash('sha256').update(JSON.stringify(course)).digest('hex');
const items = Array.from({ length: 50 }, (_, i) => ({
  id: `N26-FIN-F${String(i + 1).padStart(2, '0')}`, category: 'federal', moduleId: 'F01',
  objective: 'Synthetic private final context fixture.', stem: `Synthetic final problem ${i + 1}?`,
  options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `Synthetic final answer ${id}.` })),
  correctChoice: 'A', rationale: 'Private synthetic rationale.', independenceNote: 'Engineering only.',
  distractorRationales: { B: 'Synthetic error.', C: 'Synthetic error.', D: 'Synthetic error.' },
  sourceRefs: [{ url: 'https://www.consumerfinance.gov/rules-policy/regulations/', locator: 'Synthetic fixture',
    supports: 'No legal claim.', checkedOn: '2026-09-12' }],
  remediation: { unitIds: ['F01-U01'], focus: 'Synthetic practice.' },
}));
export const finalDeliveryFixtureCourse = freeze(course);
export const finalDeliveryFixtureDefinition = defineNmlsDraftFinal(course, {
  id: 'synthetic-first-final-context', items, moduleQuotas: { F01: 25 },
});

export async function makeFinalDeliveryFixture() {
  const actorId = randomUUID(), offeringId = randomUUID();
  const input = { actorId, sourceCourse: structuredClone(finalDeliveryFixtureCourse),
    definition: structuredClone(finalDeliveryFixtureDefinition),
    review: { id: randomUUID(), grant_id: offeringId, student_id: actorId, course_key: course.id,
      content_digest: course.digest, revision: 0, runtime: startNmlsCourseReview(course) },
    binding: { grant_id: offeringId, policy_id: P.id, policy_digest: hash(P), offering: {
      id: offeringId, contentDigest: course.digest, year: 2026, educationType: 'annual_ce', timeZone: 'UTC',
      deadlineBasisId: 'synthetic-private-fixture', opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
      rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true, evidenceId: 'synthetic-not-real-rocs' },
    } } };
  let ledger = startNmlsSessionPolicy(actorId), timeMs = Date.UTC(2026, 5, 1, 12);
  const evaluate = createNmlsObservedPolicyReviewEvaluator();
  async function act(kind, extra = {}, elapsed = 1) {
    timeMs += elapsed;
    const teaching = makeNmlsSourceTeachingContext(input);
    const command = { kind, attemptId: input.review.id, eventId: randomUUID(),
      expectedRevision: input.review.revision, expectedSourceRevision: input.review.revision, expectedWorkflowRevision: null,
      expectedActorRevision: ledger.revision, sessionId: teaching.runtime.sessionId,
      ...(ledger.observationJournal?.active ? { studyReceipt: { windowId: ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
    const result = await evaluate({ ...teaching, ledger, command, evidence: { actorId, receivedAtMs: timeMs,
      presentation: { id: randomUUID(), actorId, offeringId, contentDigest: course.digest,
        documentDigest: input.binding.offering.rocs.documentDigest, presentedAtMs: timeMs } } });
    input.review.runtime = result.runtime; input.review.revision = result.runtime.revision; ledger = result.ledger;
    return { result, command };
  }
  await act('resume');
  await act('accept_rocs', { version: '4', documentDigest: input.binding.offering.rocs.documentDigest, acknowledged: true });
  await act('resume');
  await act('open_unit', { unitId: 'F01-U01' });
  await act('interaction', { visible: true });
  await act('heartbeat', { visible: true }, 20000);
  await act('unit_action', { choice: course.modules[0].units[0].actionQuestion.correctChoice });
  assert.equal((await act('complete_unit')).result.outcome.code, 'unit_review_complete');
  await act('quiz_start', { moduleId: 'F01' });
  await act('interaction', { visible: true });
  const quiz = input.review.runtime.quiz;
  const answers = Object.fromEntries(quiz.questionIds.map(id => [id, course.modules[0].quiz.bank.find(q => q.id === id).correctChoice]));
  assert.equal((await act('quiz_submit', { quizId: quiz.id, answers })).result.outcome.code, 'module_review_passed');
  const { result, command } = await act('check_access');
  assert.equal(result.outcome.ok, true); assert.equal(result.outcome.policyCode, 'session_policy_allowed');
  assert.equal(result.outcome.deliveryAllowed, false); assert.equal(ledger.observationJournal.active, null);
  const finalId = randomUUID(), selection = drawNmlsDraftFinal(input.definition, {
    id: finalId, reviewAttemptId: input.review.id, reviewState: input.review.runtime,
  }, { draw: () => 0 });
  const issuedAt = new Date(timeMs).toISOString();
  const reservationIntent = { kind: 'reserve_first_final', attemptId: input.review.id, eventId: command.eventId,
    expectedSourceRevision: command.expectedSourceRevision, expectedActorRevision: command.expectedActorRevision,
    expectedFinalRevision: 0, sessionId: command.sessionId };
  const commandDigest = hash(reservationIntent);
  input.reservedFinal = { id: finalId, review_attempt_id: input.review.id, student_id: actorId,
    course_key: course.id, content_digest: course.digest, definition_digest: input.definition.digest,
    revision: 1, selection: structuredClone(selection), issued_at: issuedAt, submitted_at: null,
    answers: null, result: null, remediation_manifest: null };
  input.reservation = { student_id: actorId, event_id: command.eventId, review_attempt_id: input.review.id,
    command_digest: commandDigest, definition_digest: input.definition.digest,
    source_revision: input.review.revision, actor_revision: ledger.revision, reserved: true, final_id: finalId,
    selection_digest: hash(selection), recorded_at: issuedAt,
    outcome: { ok: true, code: 'private_final_reserved', status: 200, reserved: true, finalAttemptId: finalId, finalRevision: 1,
      sourceRevision: input.review.revision, actorRevision: ledger.revision, mode: 'private_authoring_review',
      studentDeliveryEnabled: false, creditIssuanceAllowed: false } };
  const lease = { student_id: actorId, attempt_id: input.review.id, session_id: command.sessionId,
    phase_kind: 'source', phase_owner_id: input.review.id, phase_active: false };
  input.teachingEvent = { student_id: actorId, event_id: command.eventId, review_attempt_id: input.review.id,
    phase_kind: 'source', phase_owner_id: input.review.id, command_digest: commandDigest,
    actor_revision: ledger.revision, source_revision: input.review.revision, workflow_revision: null,
    runtime_revision: input.review.revision, lease_before: structuredClone(lease), lease_after: structuredClone(lease),
    outcome: structuredClone(result.outcome), audit: structuredClone(result.audit), transaction_id: 1, recorded_at: issuedAt };
  input.actorPolicy = { student_id: actorId, policy_id: P.id, policy_digest: hash(P), revision: ledger.revision, ledger };
  return { input, ledger, timeMs };
}
