import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { setTimeout as pause } from 'node:timers/promises';
import { getNmlsReviewCourse } from '../../netlify/functions/_lib/nmls-review-content.mjs';
import { transactNmlsTeaching } from '../../netlify/functions/_lib/nmls-teaching-transaction.mjs';
import { transactNmlsFinalReservation } from '../../netlify/functions/_lib/nmls-final-reservation.mjs';
import { transactNmlsFirstFinalDelivery } from '../../netlify/functions/_lib/nmls-first-final-delivery.mjs';
import { digestNmlsCommand } from '../../netlify/functions/_lib/nmls-review-service.mjs';
import { NMLS_SESSION_POLICY as P } from '../../config/nmls/session-policy.mjs';
import { startNmlsCourseReview } from '../../lib/nmls-review-runtime.mjs';
import { defineNmlsDraftFinal, projectNmlsDraftFinal } from '../../lib/nmls-final-assessment.mjs';

// LOCAL DISPOSABLE SQL TEST FIXTURE ONLY. The caller supplies a disposable DB
// with students, roles and the actual migrations 023 through 035 already loaded.
// This module neither opens a DB connection nor creates an alternative writer.
// Its one-unit/ONE-SECOND course, fifty-item bank and ROCS evidence are explicitly
// SYNTHETIC. The real 032 lesson/action/quiz, 033 reservation and 035 final-delivery
// adapters are traversed; completed progress is NEVER inserted or overwritten.
// The real short wait is an engineering timer test, not human study/attendance.
// No submission, grading, HTTP, identity, approval, completion or credit claim.

function syntheticContent() {
  const course = structuredClone(getNmlsReviewCourse('nmls-2026-f01-private-review'));
  course.id = 'synthetic-first-final-sql';
  course.modules[0].units = [{ ...course.modules[0].units[0], requiredSeconds: 1 }];
  delete course.digest;
  course.digest = createHash('sha256').update(JSON.stringify(course)).digest('hex');
  const items = Array.from({ length: 50 }, (_, i) => ({
    id: `N26-FIN-F${String(i + 1).padStart(2, '0')}`, category: 'federal', moduleId: 'F01',
    objective: 'Synthetic first-final SQL fixture.', stem: `PRIVATE SYNTHETIC FINAL QUESTION ${i + 1}?`,
    options: ['A', 'B', 'C', 'D'].map(id => ({ id, text: `PRIVATE SYNTHETIC OPTION ${id}` })),
    correctChoice: 'A', rationale: 'PRIVATE SYNTHETIC RATIONALE', independenceNote: 'Engineering only.',
    distractorRationales: { B: 'Wrong.', C: 'Wrong.', D: 'Wrong.' },
    sourceRefs: [{ url: 'https://www.consumerfinance.gov/rules-policy/regulations/', locator: 'Synthetic',
      supports: 'No legal assertion.', checkedOn: '2026-09-12' }],
    remediation: { unitIds: ['F01-U01'], focus: 'Synthetic practice.' },
  }));
  const definition = defineNmlsDraftFinal(course, { id: 'synthetic-first-final-sql-bank', items, moduleQuotas: { F01: 25 } });
  return { course, definition };
}

function assertPrivateDelivery(result) {
  assert.equal(result.body.studentDeliveryEnabled, false);
  assert.equal(result.body.creditIssuanceAllowed, false);
  assert.equal(result.status, result.body.status);
  for (const key of ['runtime', 'ledger', 'audit', 'selection', 'definition',
    'candidateMaterialAllowed', 'candidateUntilMs', 'candidateWindow']) assert.equal(Object.hasOwn(result.body, key), false);
  assert.doesNotMatch(JSON.stringify(result.body), /correctChoice|rationale|"answers"|"result"|"grade"/);
}

/**
 * Return a real persisted synthetic first-final lifecycle, acknowledged by
 * default. `through` may be `reserved` or `active` for pre-acknowledgment tests.
 * Callers retain DB/RPC lifetime, migration and teardown ownership.
 *
 * `rows()` reads current durable source, actor, lease, reservedFinal and sidecar.
 * `command()` builds intent from those current rows; `run`/`act` use only the
 * existing delivery adapter. There is intentionally no submit method.
 * `answersFor(n)` returns a PRIVATE synthetic map with n correct answers from
 * the exact persisted form; it does not evaluate eligibility or issue a grade.
 */
export async function makeNmlsFirstFinalSqlFixture({ db, rpc, through = 'acknowledged' } = {}) {
  assert.equal(typeof db?.query, 'function', 'caller must supply a disposable SQL test database');
  assert.equal(typeof rpc, 'function');
  assert.ok(['reserved', 'active', 'acknowledged'].includes(through));
  const { course, definition } = syntheticContent();
  const deps = { rpc,
    courseFor: key => { assert.equal(key, course.id); return structuredClone(course); },
    definitionFor: key => { assert.equal(key, course.id); return structuredClone(definition); },
  };
  const actor = randomUUID(), grant = randomUUID();
  await db.query('insert into students values($1)', [actor]);
  await db.query(`insert into nmls_review_access_grants(id,student_id,course_key,content_digest,expires_at,granted_by,evidence)
    values($1,$2,$3,$4,clock_timestamp()+interval '1 day',$2,'SYNTHETIC disposable first-final SQL fixture')`,
  [grant, actor, course.id, course.digest]);
  await rpc('nmls_policy_bind', { p_student_id: actor, p_grant_id: grant, p_policy_id: P.id,
    p_policy_digest: digestNmlsCommand(P),
    p_offering: { id: grant, contentDigest: course.digest, year: 2026, educationType: 'annual_ce', timeZone: 'UTC',
      deadlineBasisId: 'SYNTHETIC-ONLY', opensAtMs: Date.UTC(2026, 0, 1), closesAtMs: Date.UTC(2027, 0, 1),
      rocs: { version: '4', documentDigest: 'c'.repeat(64), fullDocumentVerified: true,
        evidenceId: 'SYNTHETIC-NOT-REAL-ROCS' } } });
  const started = await rpc('nmls_policy_start', { p_student_id: actor, p_grant_id: grant,
    p_course_key: course.id, p_content_digest: course.digest, p_initial_runtime: startNmlsCourseReview(course) });
  const h = { actor, grant, attemptId: started.attempt.id, finalId: null, course, definition, deps };
  h.sourceContext = () => rpc('nmls_teaching_context', { p_student_id: actor, p_attempt_id: h.attemptId,
    p_phase_kind: 'source', p_phase_owner_id: h.attemptId });
  h.sourceCommand = async (kind, extra = {}) => {
    const c = await h.sourceContext(), r = c.attempt.runtime;
    return { kind, attemptId: h.attemptId, phaseKind: 'source', phaseOwnerId: h.attemptId, eventId: randomUUID(),
      expectedRevision: r.revision, expectedSourceRevision: c.attempt.revision, expectedWorkflowRevision: null,
      expectedActorRevision: c.actorPolicy?.revision ?? 0, sessionId: r.sessionId,
      ...(c.actorPolicy?.ledger.observationJournal?.active ? { studyReceipt: {
        windowId: c.actorPolicy.ledger.observationJournal.active.id, visible: true } } : {}),
      ...(kind === 'interaction' ? { observation: 'keyboard' } : {}), ...extra };
  };
  h.teach = (input, options = {}) => transactNmlsTeaching(input, actor, { ...deps, ...options });
  h.sourceAct = async (kind, extra = {}, options = {}) => h.teach(await h.sourceCommand(kind, extra), options);

  await h.sourceAct('resume');
  h.presentation = await rpc('nmls_policy_present_rocs', { p_student_id: actor, p_attempt_id: h.attemptId,
    p_document_digest: 'c'.repeat(64) });
  await h.sourceAct('accept_rocs', { presentationId: h.presentation.id, version: '4',
    documentDigest: 'c'.repeat(64), acknowledged: true });
  await h.sourceAct('resume');
  await h.sourceAct('open_unit', { unitId: 'F01-U01' });
  await h.sourceAct('interaction', { visible: true });
  await pause(1100);
  await h.sourceAct('heartbeat', { visible: true });
  await h.sourceAct('unit_action', { choice: course.modules[0].units[0].actionQuestion.correctChoice });
  assert.equal((await h.sourceAct('complete_unit')).body.code, 'unit_review_complete');
  await h.sourceAct('quiz_start', { moduleId: 'F01' });
  await h.sourceAct('interaction', { visible: true });
  const quiz = (await h.sourceContext()).attempt.runtime.quiz;
  const answers = Object.fromEntries(quiz.questionIds.map(id => [id,
    course.modules[0].quiz.bank.find(q => q.id === id).correctChoice]));
  h.sourceCompleted = await h.sourceAct('quiz_submit', { quizId: quiz.id, answers });
  assert.equal(h.sourceCompleted.body.code, 'module_review_passed');
  assert.equal(h.sourceCompleted.body.deliveryAllowed, false);
  assert.deepEqual(h.sourceCompleted.body.progress.lessons, []);
  assert.equal(h.sourceCompleted.body.progress.status, 'review_complete');
  // Keep an ordinary source event for namespace/replay probes.
  h.priorSourceCommand = await h.sourceCommand('check_access');
  await h.teach(h.priorSourceCommand);
  const source = await h.sourceContext();
  h.reservationCommand = { kind: 'reserve_first_final', attemptId: h.attemptId, eventId: randomUUID(),
    expectedSourceRevision: source.attempt.revision, expectedActorRevision: source.actorPolicy.revision,
    expectedFinalRevision: 0, sessionId: source.attempt.runtime.sessionId };
  h.reserved = await transactNmlsFinalReservation(h.reservationCommand, actor, deps);
  assert.equal(h.reserved.body.reserved, true);
  h.finalId = h.reserved.body.finalAttemptId;

  h.rows = async () => ({
    source: (await db.query('select * from nmls_review_attempts where id=$1', [h.attemptId])).rows[0],
    actor: (await db.query('select * from nmls_review_actor_policy where student_id=$1', [actor])).rows[0],
    delivery: (await db.query('select * from nmls_first_final_deliveries where final_id=$1', [h.finalId])).rows[0],
    lease: (await db.query('select * from nmls_review_study_leases where student_id=$1', [actor])).rows[0],
    reservedFinal: (await db.query('select * from nmls_private_finals where id=$1', [h.finalId])).rows[0],
  });
  h.command = async (kind, extra = {}, receipt = true) => {
    const current = await h.rows(), runtime = current.delivery?.runtime;
    return { kind, eventId: randomUUID(), attemptId: h.attemptId, finalAttemptId: h.finalId,
      expectedRevision: runtime?.revision ?? 0, expectedSourceRevision: current.source.revision,
      expectedFinalRevision: current.reservedFinal.revision, expectedActorRevision: current.actor.revision,
      sessionId: runtime?.sessionId ?? null,
      ...(receipt && current.actor.ledger.observationJournal?.active ? { studyReceipt: {
        windowId: current.actor.ledger.observationJournal.active.id, visible: true } } : {}), ...extra };
  };
  h.run = (input, options = {}) => transactNmlsFirstFinalDelivery(input, actor, { ...deps, ...options });
  h.act = async (kind, extra = {}, options = {}, receipt = true) => {
    const input = await h.command(kind, extra, receipt), result = await h.run(input, options), after = await h.rows();
    assert.equal(result.body.duplicate, false);
    assert.equal(after.delivery.revision, input.expectedRevision + 1, `${kind}: exactly one sidecar revision`);
    assert.equal(after.actor.revision, input.expectedActorRevision + 1, `${kind}: exactly one actor revision`);
    assert.equal(after.source.revision, input.expectedSourceRevision, `${kind}: immutable source revision`);
    assertPrivateDelivery(result);
    return result;
  };
  h.capture = async input => {
    let captured;
    await assert.rejects(() => h.run(input, { rpc: async (name, args) => {
      if (name === 'nmls_first_final_delivery_commit') {
        captured = structuredClone(args); throw Error('NMLS_FIRST_FINAL_FIXTURE_CAPTURE_ONLY');
      }
      return rpc(name, args);
    } }), /NMLS_FIRST_FINAL_FIXTURE_CAPTURE_ONLY/);
    assert.ok(captured);
    return captured;
  };
  h.answersFor = async (correctCount = 25) => {
    assert.ok(Number.isSafeInteger(correctCount) && correctCount >= 0 && correctCount <= 25);
    const { reservedFinal } = await h.rows();
    assert.equal(reservedFinal.selection.questionIds.length, 25);
    return Object.fromEntries(reservedFinal.selection.questionIds.map((id, index) => {
      const item = definition.items.find(q => q.id === id);
      assert.ok(item, 'the saved question belongs to the pinned synthetic bank');
      return [id, index < correctCount ? item.correctChoice : item.options.find(option => option.id !== item.correctChoice).id];
    }));
  };
  h.activate = async () => {
    h.activationCommand = await h.command('activate');
    h.activated = await h.run(h.activationCommand);
    assertPrivateDelivery(h.activated);
    assert.equal(h.activated.body.deliveryAllowed, true);
    const current = await h.rows();
    assert.equal(current.delivery.runtime.status, 'active');
    assert.equal(current.lease.phase_kind, 'final');
    assert.equal(current.lease.phase_owner_id, h.finalId);
    assert.equal(current.lease.phase_active, true);
    assert.deepEqual(h.activated.body.questions, projectNmlsDraftFinal(definition, current.reservedFinal.selection).questions);
    return h.activated;
  };
  h.acknowledge = async () => {
    const before = await h.rows();
    assert.equal(before.actor.ledger.observationJournal.active?.lastObservedAtMs, null, 'first acknowledgment needs an unacknowledged final window');
    await pause(20);
    h.acknowledgmentCommand = await h.command('heartbeat');
    h.acknowledged = await h.run(h.acknowledgmentCommand);
    assertPrivateDelivery(h.acknowledged);
    assert.equal(h.acknowledged.body.deliveryAllowed, true);
    const current = await h.rows();
    assert.equal(current.actor.ledger.observationJournal.active.id, before.actor.ledger.observationJournal.active.id);
    assert.ok(Number.isSafeInteger(current.actor.ledger.observationJournal.active.lastObservedAtMs));
    assert.deepEqual(current.actor.ledger.studyIntervals, before.actor.ledger.studyIntervals);
    assert.equal(current.actor.ledger.studySinceBreakMs, before.actor.ledger.studySinceBreakMs);
    assert.equal(current.delivery.runtime.lastActivityMs, before.delivery.runtime.lastActivityMs);
    return h.acknowledged;
  };
  if (through !== 'reserved') await h.activate();
  if (through === 'acknowledged') await h.acknowledge();
  return h;
}
