import { createHash } from 'node:crypto';
import { isDeepStrictEqual as same } from 'node:util';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { NMLS_POLICY_DIGEST } from './nmls-policy-transaction.mjs';
import { NMLS_SESSION_POLICY as POLICY } from '../../../config/nmls/session-policy.mjs';
import { validateNmlsAnnualWindow } from '../../../lib/nmls-session-policy.mjs';

// Read-only discovery. No reducer, evaluator, final loader, grading, drawing,
// session bootstrap or material hydration belongs in this module. The cursor
// is advisory saved state, not a capability or permission to call any writer.
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const sha = v => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v);
const integer = v => Number.isSafeInteger(v) && v >= 0;
const id = v => typeof v === 'string' && v.length > 0 && v.length <= 160;
const flags = { advisory: true, deliveryAllowed: false, studentDeliveryEnabled: false, creditIssuanceAllowed: false };
const fail = () => { throw Error('nmls_learning_snapshot_requires_review'); };
const error = (status, suffix) => ({ status, body: { ok: false, code: `nmls_learning_snapshot_${suffix}`, ...flags } });
const cursorKeys = ['grantId', 'attemptId', 'firstFinalId', 'secondFinalId', 'sourceRevision', 'finalRevision',
  'workflowRevision', 'runtimeRevision', 'actorRevision'];
const progressKeys = ['courseKey', 'contentDigest', 'revision', 'status', 'completedUnitIds', 'passedModuleIds',
  'completedReviewMs', 'currentUnitId', 'quizModuleId'];
const deniedTokens = new Set(['nmls_learning_snapshot_access_denied', 'nmls_first_final_submission_access_denied']);
const reviewTokens = new Set(['nmls_learning_snapshot_requires_review', 'nmls_review_invalid_rocs_receipt',
  'nmls_first_final_submission_scope_changed', 'nmls_first_final_submission_source_incomplete',
  'nmls_first_final_submission_reservation_provenance', 'nmls_first_final_submission_source_changed',
  'nmls_first_final_submission_invalid_payload', 'nmls_first_final_submission_denial_payload',
  'nmls_first_final_submission_invalid_result', 'nmls_first_final_submission_invalid_child',
  'nmls_teaching_invalid_runtime', 'nmls_teaching_invalid_layout', 'nmls_teaching_invalid_completion',
  'nmls_teaching_invalid_unit_completion', 'nmls_teaching_invalid_module_completion',
  'nmls_teaching_invalid_denied_progress', 'nmls_review_session_conflict']);

function layoutFor(modules) {
  return modules.map(m => ({ id: m.id, units: m.units.map(u => ({ id: u.id,
    requiredMs: u.requiredSeconds * 1000, requiredActionIds: [u.actionQuestion.id] })),
  passPercent: m.quiz.passPercent, questionsPerAttempt: m.quiz.questionsPerAttempt }));
}

function verifyCourse(course, grant) {
  if (!plain(course) || course.id !== grant.courseKey || course.digest !== grant.contentDigest ||
      !sha(course.digest) || typeof course.title !== 'string' || !course.title.trim() || course.title.length > 1000 ||
      course.mode !== 'non_credit_review' || course.salesAuthorized !== false ||
      !Array.isArray(course.modules) || !course.modules.length) fail();
  const { digest, ...source } = course;
  if (createHash('sha256').update(JSON.stringify(source)).digest('hex') !== digest) fail();
  const moduleIds = [], unitIds = [];
  for (const m of course.modules) {
    if (!plain(m) || !id(m.id) || !Array.isArray(m.units) || !m.units.length || !plain(m.quiz) ||
        !integer(m.quiz.questionsPerAttempt) || !m.quiz.questionsPerAttempt ||
        !integer(m.quiz.passPercent) || m.quiz.passPercent < 1 || m.quiz.passPercent > 100) fail();
    moduleIds.push(m.id);
    for (const u of m.units) {
      if (!plain(u) || !id(u.id) || !integer(u.requiredSeconds) || u.requiredSeconds <= 0 ||
          !id(u.actionQuestion?.id)) fail();
      unitIds.push(u.id);
    }
  }
  if (new Set(moduleIds).size !== moduleIds.length || new Set(unitIds).size !== unitIds.length) fail();
  return layoutFor(course.modules);
}

function checkProgress(p, modules, key, digest) {
  if (!exact(p, progressKeys) || p.courseKey !== key || p.contentDigest !== digest || !integer(p.revision) ||
      !['active', 'logged_out', 'review_complete'].includes(p.status) || !integer(p.completedReviewMs) ||
      !Array.isArray(p.completedUnitIds) || !Array.isArray(p.passedModuleIds)) fail();
  const units = modules.flatMap(m => m.units), moduleIds = modules.map(m => m.id), unitIds = units.map(u => u.id);
  if (!same(p.completedUnitIds, unitIds.slice(0, p.completedUnitIds.length)) || p.completedUnitIds.length > unitIds.length ||
      !same(p.passedModuleIds, moduleIds.slice(0, p.passedModuleIds.length)) || p.passedModuleIds.length > moduleIds.length ||
      p.completedReviewMs !== units.slice(0, p.completedUnitIds.length).reduce((n, u) => n + u.requiredSeconds * 1000, 0)) fail();
  for (const m of modules.filter(m => p.passedModuleIds.includes(m.id))) {
    if (m.units.some(u => !p.completedUnitIds.includes(u.id))) fail();
  }
  if (p.currentUnitId !== null && (p.status !== 'active' || p.currentUnitId !== unitIds[p.completedUnitIds.length] || p.quizModuleId !== null)) fail();
  if (p.quizModuleId !== null) {
    const m = modules[p.passedModuleIds.length];
    if (p.status !== 'active' || !m || m.id !== p.quizModuleId || m.units.some(u => !p.completedUnitIds.includes(u.id))) fail();
  }
  if ((p.status === 'review_complete') !== (p.passedModuleIds.length === modules.length) ||
      p.status === 'review_complete' && (p.completedUnitIds.length !== units.length || p.currentUnitId !== null || p.quizModuleId !== null) ||
      p.status === 'logged_out' && (p.currentUnitId !== null || p.quizModuleId !== null)) fail();
  return { completedUnitCount: p.completedUnitIds.length, totalUnitCount: units.length,
    completedModuleCount: p.passedModuleIds.length, totalModuleCount: modules.length,
    currentUnitId: p.currentUnitId,
    currentModuleId: p.currentUnitId === null ? p.quizModuleId : modules.find(m => m.units.some(u => u.id === p.currentUnitId)).id };
}

function project(context, course, grantId, studentId) {
  if (!exact(context, ['version', 'grant', 'binding', 'phase', 'status', 'serverTimeMs', 'cursor',
    'sourceProgress', 'teachingProgress', 'sourceLayout', 'teachingLayout']) ||
      context.version !== 'nmls-learning-snapshot-private-v1' || !integer(context.serverTimeMs)) fail();
  const g = context.grant, b = context.binding, c = context.cursor;
  if (!exact(g, ['id', 'studentId', 'courseKey', 'contentDigest', 'accessMode', 'status', 'expiresAtMs']) ||
      g.id !== grantId || g.studentId !== studentId || g.accessMode !== 'non_credit_review' || g.status !== 'active' ||
      !integer(g.expiresAtMs) || g.expiresAtMs <= context.serverTimeMs ||
      !exact(b, ['policyId', 'policyDigest', 'offering']) || b.policyId !== POLICY.id || b.policyDigest !== NMLS_POLICY_DIGEST ||
      !plain(b.offering) || b.offering.id !== g.id || b.offering.contentDigest !== g.contentDigest ||
      !exact(c, cursorKeys) || c.grantId !== g.id) fail();
  validateNmlsAnnualWindow(b.offering);
  const expectedLayout = verifyCourse(course, g);
  for (const key of ['attemptId', 'firstFinalId', 'secondFinalId']) if (c[key] !== null && !uuid(c[key])) fail();
  for (const key of ['sourceRevision', 'finalRevision', 'workflowRevision', 'runtimeRevision', 'actorRevision']) {
    if (c[key] !== null && !integer(c[key])) fail();
  }
  if (new Set([c.attemptId, c.firstFinalId, c.secondFinalId].filter(Boolean)).size !==
      [c.attemptId, c.firstFinalId, c.secondFinalId].filter(Boolean).length) fail();
  let progress;
  if (context.phase === 'not_started') {
    if (context.status !== 'not_started' || ['attemptId', 'firstFinalId', 'secondFinalId', 'sourceRevision', 'finalRevision',
      'workflowRevision', 'runtimeRevision'].some(k => c[k] !== null) || context.sourceProgress !== null ||
      context.teachingProgress !== null || context.sourceLayout !== null || context.teachingLayout !== null) fail();
    progress = { completedUnitCount: 0, totalUnitCount: course.modules.flatMap(m => m.units).length,
      completedModuleCount: 0, totalModuleCount: course.modules.length, currentUnitId: null, currentModuleId: null };
  } else {
    if (!uuid(c.attemptId) || !integer(c.sourceRevision) || !integer(c.runtimeRevision) ||
        c.sourceRevision > 0 && (!integer(c.actorRevision) || c.actorRevision < 1) ||
        c.sourceRevision > 0 && !same(context.sourceLayout, expectedLayout) ||
        c.sourceRevision === 0 && context.sourceLayout !== null) fail();
    checkProgress(context.sourceProgress, course.modules, course.id, course.digest);
    if (context.sourceProgress.revision !== c.sourceRevision) fail();
    if (c.sourceRevision === 0 && (context.sourceProgress.status !== 'logged_out' ||
        context.sourceProgress.completedUnitIds.length !== 0 || context.sourceProgress.passedModuleIds.length !== 0)) fail();
    let modules = course.modules;
    if (c.workflowRevision !== null) {
      if (c.finalRevision !== 2 || !uuid(c.firstFinalId) || c.workflowRevision < 1 || !Array.isArray(context.teachingLayout) ||
          !context.teachingLayout.length) fail();
      modules = course.modules.filter(m => context.teachingLayout.some(x => x.id === m.id));
      if (!same(context.teachingLayout, layoutFor(modules)) || !sha(context.teachingProgress?.contentDigest) ||
          context.teachingProgress.courseKey !== `${course.id}-remediation-${c.firstFinalId}`) fail();
      if (c.workflowRevision === 1 && (context.teachingProgress.revision !== 0 || context.teachingProgress.status !== 'logged_out' ||
          context.teachingProgress.completedUnitIds?.length !== 0 || context.teachingProgress.passedModuleIds?.length !== 0)) fail();
    } else if (!same(context.teachingLayout, context.sourceLayout) || !same(context.teachingProgress, context.sourceProgress)) fail();
    progress = checkProgress(context.teachingProgress, modules,
      c.workflowRevision === null ? course.id : `${course.id}-remediation-${c.firstFinalId}`,
      c.workflowRevision === null ? course.digest : context.teachingProgress.contentDigest);
    if (context.phase === 'source') {
      if (c.firstFinalId !== null || c.finalRevision !== null || c.workflowRevision !== null || c.secondFinalId !== null ||
          context.status !== context.sourceProgress.status || c.runtimeRevision !== c.sourceRevision) fail();
    } else {
      if (!uuid(c.firstFinalId) || ![1, 2].includes(c.finalRevision) || context.sourceProgress.status !== 'review_complete') fail();
      if (context.phase === 'first_final') {
        if (c.finalRevision !== 1 || c.workflowRevision !== null || c.secondFinalId !== null ||
            !['reserved', 'active', 'paused', 'logged_out'].includes(context.status) || c.runtimeRevision === 0 && context.status !== 'reserved') fail();
      } else if (context.phase === 'remediation') {
        if (c.finalRevision !== 2 || c.workflowRevision === null || c.secondFinalId !== null ||
            context.status !== context.teachingProgress.status || c.runtimeRevision !== context.teachingProgress.revision) fail();
      } else if (context.phase === 'second_final') {
        if (c.finalRevision !== 2 || !uuid(c.secondFinalId) || c.workflowRevision === null ||
            context.teachingProgress.status !== 'review_complete' || !['reserved', 'active', 'paused', 'logged_out'].includes(context.status) ||
            c.runtimeRevision === 0 && context.status !== 'reserved') fail();
      } else if (context.phase === 'terminal') {
        if (c.finalRevision !== 2 || c.runtimeRevision < 1 || !['passed', 'staff_review_required'].includes(context.status) ||
            c.secondFinalId === null && (context.status !== 'passed' || c.workflowRevision !== null) ||
            c.secondFinalId !== null && (c.workflowRevision === null || context.teachingProgress.status !== 'review_complete')) fail();
      } else fail();
    }
  }
  return { status: 200, body: { ok: true, code: 'nmls_learning_snapshot', version: 'nmls-learning-snapshot-v1',
    mode: 'non_credit_review', ...flags, phase: context.phase, status: context.status,
    hold: context.serverTimeMs < b.offering.opensAtMs ? 'offering_not_open' :
      context.serverTimeMs >= b.offering.closesAtMs ? 'offering_closed' : null,
    course: { id: course.id, title: course.title }, cursor: structuredClone(c), progress } };
}

export async function getNmlsLearningSnapshot(input, studentId, { rpc, courseFor = getNmlsReviewCourse } = {}) {
  if (!exact(input, ['grantId']) || !uuid(input.grantId)) return error(400, 'invalid_request');
  if (!uuid(studentId)) return error(403, 'access_denied');
  const grantId = input.grantId; // Snapshot intent before any await.
  let context;
  try {
    if (typeof rpc !== 'function') return error(503, 'unavailable');
    context = structuredClone(await rpc('nmls_learning_snapshot', { p_student_id: studentId, p_grant_id: grantId }));
  } catch (e) {
    // Only finite, exact SQL tokens classify an error. Do not invoke a getter
    // or infer authority from arbitrary transport prose containing a token.
    const message = e !== null && typeof e === 'object' ? Object.getOwnPropertyDescriptor(e, 'message')?.value : undefined;
    if (deniedTokens.has(message)) return error(403, 'access_denied');
    if (reviewTokens.has(message)) return error(409, 'requires_review');
    return error(503, 'unavailable');
  }
  try {
    if (!id(context?.grant?.courseKey)) fail();
    const course = structuredClone(await courseFor(context.grant.courseKey));
    return project(context, course, grantId, studentId);
  } catch {
    // Never echo raw SQL errors, source data, policy evidence or a partial view.
    return error(409, 'requires_review');
  }
}
