import test from 'node:test';
import assert from 'node:assert/strict';
import { validateNmlsOssManifest, nmlsAssessmentPassed } from '../lib/nmls-oss-validation.mjs';
import { startNmlsUnitReview, applyNmlsUnitReviewEvent } from '../lib/nmls-oss-unit-ledger.mjs';

// Synthetic fixtures exercise validation only. Not course content, review
// evidence, an NMLS approval, or substitute learner timing-study participants.
function quiz(prefix, count, passPercent = 80) {
  return { questionsPerAttempt: count, passPercent, bank: Array.from({ length: count * 2 }, (_, i) => ({
    id: `${prefix}-${i}`, type: 'single_choice', stem: `Synthetic validation fixture ${prefix}-${i}`, options: ['One', 'Two', 'Three'],
    correctIndex: 0, rationale: 'Test fixture only.', sourceUrls: ['https://example.test/source'], objectiveId: 'fixture', reviewStatus: 'accepted',
  })) };
}
function manifest() {
  return { id: 'fixture', contentVersion: 'test-only', format: 'OSS', educationType: 'CE', year: 2026, hours: 1,
    credit: { federal: 0, ethics: 0, nontraditional: 0, general: 1, state: 0 },
    modules: [0, 1].map((i) => ({ id: `m${i}`, units: [0, 1].map((j) => ({ id: `u${i}-${j}`, topic: 'general', requiredSeconds: 750,
      contentRef: 'fixture.md', objectiveIds: ['fixture'], sourceUrls: ['https://example.test/source'], requiredActionIds: [`a${i}-${j}`] })), quiz: quiz(`q${i}`, 5) })),
    final: { ...quiz('final', 15, 70), creditSeconds: 0 },
  };
}

test('structural success does not claim content sufficiency or approval', () => {
  const result = validateNmlsOssManifest(manifest());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.plannedInstructionSeconds.general, 3000);
  assert.equal(result.approvalEstablished, false);
  assert.equal(result.contentSufficiencyEstablished, false);
});

test('shortfall, single module, long media, undersized bank and true/false cannot pass', () => {
  const cases = [
    ['topic_time_shortfall', (m) => { m.modules[0].units[0].requiredSeconds -= 1; }],
    ['multiple_modules_required', (m) => { m.modules.length = 1; }],
    ['multiple_module_units_required', (m) => { m.modules[0].units.length = 1; }],
    ['immutable_content_reference_required', (m) => { m.id = {}; }],
    ['unit_content_evidence_missing', (m) => { m.modules[0].units[0].sourceUrls = ['javascript:alert(1)']; }],
    ['unit_active_learning_required', (m) => { m.modules[0].units[0].requiredActionIds = [null]; }],
    ['assessment_evidence_missing', (m) => { m.final.bank[0].objectiveId = {}; }],
    ['media_segment_invalid', (m) => { m.modules[0].units[0].media = [{ kind: 'video', durationSeconds: 301 }]; }],
    ['assessment_attempt_size_invalid', (m) => { m.modules[0].quiz.questionsPerAttempt = 4; }],
    ['assessment_bank_too_small', (m) => { m.modules[0].quiz.bank.length = 9; }],
    ['duplicate_assessment_stem', (m) => { m.modules[0].quiz.bank[1].stem = m.modules[0].quiz.bank[0].stem; }],
    ['assessment_item_invalid', (m) => { m.modules[0].quiz.bank[0].type = 'true_false'; }],
    ['assessment_human_review_missing', (m) => { m.final.bank[0].reviewStatus = 'draft'; }],
    ['final_credit_exceeds_limit', (m) => { m.final.creditSeconds = 601; }],
  ];
  for (const [code, mutate] of cases) {
    const m = manifest(); mutate(m);
    assert.ok(validateNmlsOssManifest(m).errors.some((e) => e.code === code), code);
  }
  for (const bad of [null, [], { modules: 1 }, { modules: [null] }, { modules: [{ units: [null], quiz: { bank: [null] } }] }]) {
    assert.equal(validateNmlsOssManifest(bad).ok, false);
  }
  const malformed = manifest();
  malformed.modules[0].units[0].requiredActionIds = {};
  malformed.modules[0].units[0].media = [{ kind: 'video', durationSeconds: 20, afterActivityId: 'x' }];
  malformed.modules[0].units[0].untimedActivities = [{ creditSeconds: 20, comprehensionCheckId: 'x' }];
  assert.equal(validateNmlsOssManifest(malformed).ok, false);
});

test('exam pass calculation does not round 17/25 up; larger courses require 25 questions', () => {
  assert.equal(nmlsAssessmentPassed(17, 25), false);
  assert.equal(nmlsAssessmentPassed(18, 25), true);
  assert.equal(nmlsAssessmentPassed(10, 15), false);
  assert.equal(nmlsAssessmentPassed(11, 15), true);
  assert.equal(nmlsAssessmentPassed(26, 25), false);
  assert.equal(nmlsAssessmentPassed(NaN, 25), false);
  const m = manifest(); m.hours = 8; m.credit.general = 8;
  m.modules.forEach((module) => { module.units.forEach((unit) => { unit.requiredSeconds = 6000; }); });
  assert.ok(validateNmlsOssManifest(m).errors.some((e) => e.path === 'final' && e.code === 'assessment_attempt_size_invalid'));
  m.final = { ...quiz('final', 25, 70), creditSeconds: 0 };
  assert.equal(validateNmlsOssManifest(m).ok, true);
});

const newState = (seconds = 180) => startNmlsUnitReview({ sessionId: 's', attemptId: 'a',
  unit: { id: 'u', requiredSeconds: seconds, requiredActionIds: ['check'] }, receivedAtMs: 0 });
function apply(state, at, kind = 'activity', extra = {}, evidence = {}) {
  return applyNmlsUnitReviewEvent(state, { id: `e${state.revision}`, sessionId: 's', attemptId: 'a', expectedRevision: state.revision, kind, ...extra },
    { receivedAtMs: at, engagementValidated: true, visible: true, ...evidence });
}
function accrued179() {
  let state = apply(newState(), 0).state;
  for (const t of [30000, 60000, 90000, 120000, 150000, 179000]) state = apply(state, t).state;
  return state;
}

test('six-minute boundary logs out and invalidates 179 seconds before handling completion', () => {
  const prior = accrued179();
  assert.equal(prior.provisionalMs, 179000);
  const result = apply(prior, 539000, 'complete');
  assert.equal(result.code, 'course_logout_required');
  assert.equal(result.state.status, 'logged_out');
  assert.equal(result.state.provisionalMs, 0);
  assert.equal(result.state.audit.at(-1).invalidatedMs, 179000);
  assert.equal(prior.provisionalMs, 179000, 'input is immutable');
  assert.equal(apply(result.state, 540000).code, 'course_logout_required');
});

test('hidden events, network gaps, clock changes and mismatched sessions grant no extra time', () => {
  let state = apply(newState(), 0).state;
  state = apply(state, 15000, 'activity', {}, { visible: false }).state;
  state = apply(state, 30000).state;
  assert.equal(state.provisionalMs, 0);
  state = apply(state, 90000).state;
  assert.equal(state.provisionalMs, 0, 'large gap is not retrospectively credited');
  assert.equal(apply(state, 89999).code, 'non_monotonic_server_receipt');
  assert.equal(apply(state, 90001, 'activity', { sessionId: 'other' }).code, 'attempt_or_session_mismatch');
  const hidden = apply(state, 100000, 'activity', {}, { visible: false }).state;
  assert.equal(hidden.lastActivityMs, 90000);
  assert.equal(apply(hidden, 450000).code, 'course_logout_required');
});

test('duplicate event does not add time; stale revision and unverified answers do not advance', () => {
  const start = newState();
  const first = apply(start, 0).state;
  const duplicate = apply(first, 15000, 'activity', { id: 'e0', expectedRevision: 0 });
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.state.provisionalMs, 0);
  assert.equal(duplicate.state.revision, 1);
  assert.equal(apply(first, 15000, 'activity', { expectedRevision: 0 }).code, 'stale_event_revision');
  assert.equal(apply(first, 15000, 'verify_action', { actionId: 'check' }).code, 'action_evidence_required');
  assert.equal(apply(first, 15000, 'complete').code, 'unit_requirements_unmet');
});

test('review completion requires both sufficient time and independently verified activity', () => {
  let state = apply(newState(30), 0).state;
  state = apply(state, 30000).state;
  assert.equal(apply(state, 30001, 'complete').code, 'unit_requirements_unmet');
  state = apply(state, 30002, 'verify_action', { actionId: 'check' }, { verifiedActionId: 'check' }).state;
  const completed = apply(state, 30003, 'complete');
  assert.equal(completed.ok, true);
  assert.equal(completed.state.completedMs, 30000);
  assert.equal(completed.state.status, 'completed');
  assert.equal(completed.state.creditIssuanceAllowed, false);
  assert.equal(apply(completed.state, 30004, 'complete', { id: `e${state.revision}`, expectedRevision: state.revision }).duplicate, true);
  assert.equal(apply(completed.state, 400000).code, 'unit_already_completed');
});
