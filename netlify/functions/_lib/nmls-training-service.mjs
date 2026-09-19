import { randomUUID } from 'node:crypto';
import { startNmlsCourseReview, projectNmlsReview, reduceNmlsReview } from '../../../lib/nmls-review-runtime.mjs';
import { validateNmlsCurrentUnit, validateNmlsReviewContinuity } from '../../../lib/nmls-review-continuity.mjs';
import { drawNmlsDraftFinal, projectNmlsDraftFinal, gradeNmlsDraftFinal,
  makeNmlsFinalRemediationCourse, requireNmlsFinalReviewCompletion } from '../../../lib/nmls-final-assessment.mjs';
import { getNmlsDraftFinalDefinition } from '../../../lib/nmls-final-authoring-content.mjs';
import { getNmlsReviewCourse } from './nmls-review-content.mjs';
import { digestNmlsCommand, validateNmlsReviewInput } from './nmls-review-service.mjs';
import { NMLS_TRAINING_COURSE } from '../../../config/nmls-course-identity.mjs';
import { NMLS_OSS_REQUIREMENTS as REVIEW_POLICY } from '../../../config/nmls/oss-policy.mjs';

// Explicit free-training persistence. Never calls a CE grant, policy, ledger,
// lease, credit or payment writer. Existing private source/release flags remain
// unchanged; this module owns only a truthful non-credit training projection.
export const NMLS_TRAINING_COURSE_ID = NMLS_TRAINING_COURSE.id;
export const NMLS_TRAINING_COURSE_VERSION = NMLS_TRAINING_COURSE.version;
export const NMLS_TRAINING_SOURCE_KEY = NMLS_TRAINING_COURSE.contentKey;
const SCHEMA = 'nmls-free-training-runtime-v1';
const phases = ['source', 'first_assessment', 'remediation_required', 'remediation', 'second_assessment', 'passed', 'staff_review_required'];
const plain = v => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
const uuid = v => typeof v === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
const integer = v => Number.isSafeInteger(v) && v >= 0;
const exact = (v, keys) => plain(v) && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const same = (a, b) => digestNmlsCommand(a) === digestNmlsCommand(b);
const fail = code => { throw new Error(`nmls_training_${code}`); };
const actionKinds = ['resume', 'logout', 'open_unit', 'heartbeat', 'interaction', 'unit_action', 'complete_unit', 'quiz_start', 'quiz_submit'];
const notice = 'Free mortgage training only. No NMLS CE credit, approved instructional hours, license qualification or regulatory certificate. Saved practice time is not verified attendance.';
let cachedDefinition;
const trainingDefinition = key => cachedDefinition ||= getNmlsDraftFinalDefinition(key);
const sourceHashes = new WeakMap(), sealedHistory = new Map();
const deeplyFrozen = value => value === null || typeof value !== 'object' ||
  Object.isFrozen(value) && Object.values(value).every(deeplyFrozen);
function sourceHash(course) {
  if (sourceHashes.has(course)) return sourceHashes.get(course);
  const hash = digestNmlsCommand(course);
  // Only genuinely immutable server artifacts can skip repeat payload hashing.
  if (deeplyFrozen(course)) sourceHashes.set(course, hash);
  return hash;
}
function sealedFinal(definition, course, final) {
  const key = digestNmlsCommand({ definition: definition.digest, source: sourceHash(course), final });
  if (sealedHistory.has(key)) return sealedHistory.get(key);
  if (!same(gradeNmlsDraftFinal(definition, final.selection, final.answers), final.result)) fail('history_invalid');
  const child = final.selection.number === 1 && !final.result.passed
    ? makeNmlsFinalRemediationCourse(definition, course, final.selection, final.answers) : null;
  // Bounded optimization, not authority: changed source/selection/answer/result
  // bytes produce a different key and are independently checked again.
  if (sealedHistory.size >= 64) sealedHistory.delete(sealedHistory.keys().next().value);
  sealedHistory.set(key, child);
  return child;
}

// Take a data-only copy before the first await; reject accessors and executable
// values instead of invoking a caller-controlled getter during validation.
function copyInput(input) {
  let count = 0; const active = new Set();
  const copy = (v, depth) => {
    if (++count > 1000 || depth > 8) fail('invalid_request');
    if (v === null || typeof v === 'string' || typeof v === 'boolean' || typeof v === 'number' && Number.isFinite(v)) return v;
    if ((!plain(v) && !Array.isArray(v)) || active.has(v)) fail('invalid_request');
    const descriptors = Object.getOwnPropertyDescriptors(v), keys = Reflect.ownKeys(v);
    if (keys.some(k => typeof k !== 'string')) fail('invalid_request');
    if (Array.isArray(v) && (v.length > 1000 || keys.length !== v.length + 1 ||
      !Array.from({ length: v.length }, (_, i) => String(i)).every(k => Object.hasOwn(v, k)))) fail('invalid_request');
    active.add(v); const entries = [];
    for (const key of keys) {
      if (Array.isArray(v) && key === 'length') continue;
      const d = descriptors[key];
      if (!Object.hasOwn(d, 'value') || !d.enumerable) fail('invalid_request');
      entries.push([key, copy(d.value, depth + 1)]);
    }
    active.delete(v);
    return Array.isArray(v) ? entries.map(([, value]) => value) : Object.fromEntries(entries);
  };
  return copy(input, 0);
}

export function validateNmlsTrainingInput(input) {
  const value = copyInput(input);
  if (!exact(value, ['operation', 'command']) || !['snapshot', 'teaching', 'issue_assessment', 'submit_assessment', 'start_remediation'].includes(value.operation)) fail('invalid_request');
  const { operation, command: c } = value;
  const keys = operation === 'snapshot' ? ['enrollmentId'] : ['enrollmentId', 'eventId', 'expectedRevision'];
  if (operation === 'teaching') keys.push('action');
  if (operation === 'submit_assessment') keys.push('assessmentId', 'answers');
  if (!exact(c, keys) || !uuid(c.enrollmentId)) fail('invalid_request');
  if (operation !== 'snapshot' && (!uuid(c.eventId) || !integer(c.expectedRevision))) fail('invalid_request');
  if (operation === 'teaching') {
    if (!plain(c.action) || !actionKinds.includes(c.action.kind) || !Object.hasOwn(c.action, 'sessionId') ||
      ['attemptId', 'eventId', 'expectedRevision'].some(k => Object.hasOwn(c.action, k)) ||
      (c.action.sessionId !== null && !uuid(c.action.sessionId)) ||
      (c.action.kind !== 'resume' && !uuid(c.action.sessionId))) fail('invalid_request');
    try { validateNmlsReviewInput({ ...c.action, attemptId: c.enrollmentId, eventId: c.eventId, expectedRevision: 0 }); }
    catch { fail('invalid_request'); }
  }
  if (operation === 'submit_assessment' && (!uuid(c.assessmentId) || !plain(c.answers) || Object.keys(c.answers).length !== 25 ||
    Object.entries(c.answers).some(([id, answer]) => !/^N26-FIN-[FENG]\d{2}$/.test(id) || !['A', 'B', 'C', 'D'].includes(answer)))) fail('invalid_request');
  // PostgreSQL UUIDs serialize lowercase. Canonicalize before hashing and audit
  // generation, so valid mixed-case IDs neither fail scope checks nor create a
  // different idempotency digest for the same logical command.
  c.enrollmentId = c.enrollmentId.toLowerCase();
  if (operation !== 'snapshot') c.eventId = c.eventId.toLowerCase();
  if (operation === 'teaching') {
    if (c.action.sessionId !== null) c.action.sessionId = c.action.sessionId.toLowerCase();
    if (c.action.kind === 'quiz_submit') c.action.quizId = c.action.quizId.toLowerCase();
  }
  if (operation === 'submit_assessment') c.assessmentId = c.assessmentId.toLowerCase();
  return value;
}

function continuity(actor, enrollment, course) {
  return { scope: { actorId: actor, attemptId: enrollment, offeringId: enrollment, courseKey: course.id, contentDigest: course.digest },
    // Provider training bookmarking, NOT CE observation/recovery authorization.
    saveAllowed: true, restoreAllowed: true };
}

function validateReview(runtime, course, actor, enrollment, at) {
  const base = ['mode', 'creditIssuanceAllowed', 'courseKey', 'contentDigest', 'revision', 'status', 'sessionId', 'lastActivityMs',
    'lastReceiptMs', 'completedUnitIds', 'completedReviewMs', 'passedModuleIds', 'current', 'quiz', 'feedback'];
  if (!plain(runtime) || Object.keys(runtime).some(k => ![...base, 'bookmark', 'quizReservation'].includes(k)) ||
    base.some(k => !Object.hasOwn(runtime, k)) || runtime.mode !== 'non_credit_review' || runtime.creditIssuanceAllowed !== false ||
    runtime.courseKey !== course.id || runtime.contentDigest !== course.digest || !integer(runtime.revision) ||
    !['active', 'logged_out', 'review_complete'].includes(runtime.status) || !integer(runtime.lastReceiptMs) || runtime.lastReceiptMs > at ||
    (runtime.sessionId !== null && !uuid(runtime.sessionId)) ||
    (runtime.lastActivityMs !== null && (!integer(runtime.lastActivityMs) || runtime.lastActivityMs > runtime.lastReceiptMs)) ||
    runtime.status === 'active' && (!uuid(runtime.sessionId) || runtime.lastActivityMs === null) ||
    runtime.status === 'logged_out' && runtime.sessionId !== null) fail('history_invalid');
  const units = course.modules.flatMap(m => m.units), moduleIds = course.modules.map(m => m.id);
  if (!Array.isArray(runtime.completedUnitIds) || !same(runtime.completedUnitIds, units.slice(0, runtime.completedUnitIds.length).map(u => u.id)) ||
    !Array.isArray(runtime.passedModuleIds) || !same(runtime.passedModuleIds, moduleIds.slice(0, runtime.passedModuleIds.length)) ||
    runtime.passedModuleIds.some(id => !course.modules.find(m => m.id === id).units.every(u => runtime.completedUnitIds.includes(u.id))) ||
    runtime.completedReviewMs !== units.filter(u => runtime.completedUnitIds.includes(u.id)).reduce((n, u) => n + u.requiredSeconds * 1000, 0) ||
    (runtime.status === 'review_complete') !== (runtime.passedModuleIds.length === moduleIds.length) ||
    runtime.status !== 'active' && (runtime.current !== null || runtime.quiz !== null)) fail('history_invalid');
  validateNmlsReviewContinuity(runtime, course, continuity(actor, enrollment, course), at);
  if (runtime.current) {
    validateNmlsCurrentUnit(runtime, course, runtime.current, at);
    if (runtime.current.sessionId !== runtime.sessionId) fail('history_invalid');
  }
  publicFeedback(runtime.feedback);
}

function contextState(c, actor, enrollment, course, definition) {
  if (!plain(c) || c.studentId !== actor || c.enrollmentId !== enrollment || c.courseId !== NMLS_TRAINING_COURSE_ID ||
    c.courseVersion !== NMLS_TRAINING_COURSE_VERSION || ![null, 'student_reviewer', 'regulator_reviewer'].includes(c.reviewRole)) fail('access_denied');
  if (course.id !== NMLS_TRAINING_SOURCE_KEY || course.digest !== NMLS_TRAINING_COURSE.contentDigest || course.digest !== c.contentDigest || definition.courseKey !== course.id ||
    definition.contentDigest !== course.digest || definition.sourcePayloadDigest !== sourceHash(course) || definition.digest !== c.definitionDigest) fail('content_changed');
  if (!integer(c.revision) || !integer(c.serverTimeMs) || !Object.hasOwn(c, 'runtime') || !Object.hasOwn(c, 'event') ||
    c.event !== null && (!plain(c.event) || !/^[a-f0-9]{64}$/.test(c.event.command_digest))) fail('history_invalid');
  if (c.runtime === null) { if (c.revision !== 0) fail('history_invalid'); return { state: null, child: null }; }
  const s = c.runtime;
  if (!exact(s, ['schema', 'purpose', 'courseId', 'courseVersion', 'sourceCourseKey', 'contentDigest', 'definitionDigest', 'revision', 'phase', 'source', 'remediation', 'finals']) ||
    s.schema !== SCHEMA || s.purpose !== 'free_training' || s.courseId !== c.courseId || s.courseVersion !== c.courseVersion ||
    s.sourceCourseKey !== course.id || s.contentDigest !== course.digest || s.definitionDigest !== definition.digest ||
    s.revision !== c.revision || !phases.includes(s.phase) || !Array.isArray(s.finals) || s.finals.length > 2) fail('history_invalid');
  validateReview(s.source, course, actor, enrollment, c.serverTimeMs);
  for (const [index, final] of s.finals.entries()) {
    if (!exact(final, ['selection', 'answers', 'result']) || final.selection?.number !== index + 1 ||
      final.selection.reviewAttemptId !== enrollment) fail('history_invalid');
    projectNmlsDraftFinal(definition, final.selection); // validates saved selection/quota, never draws
    if (final.answers === null) { if (final.result !== null || index !== s.finals.length - 1) fail('history_invalid'); }
    else sealedFinal(definition, course, final);
  }
  if (s.finals.length) requireNmlsFinalReviewCompletion(definition, s.source);
  const first = s.finals[0], second = s.finals[1];
  if (second && (!first.result || first.result.passed || first.selection.id === second.selection.id ||
    second.selection.questionIds.some(id => first.selection.questionIds.includes(id)))) fail('history_invalid');
  let child = null;
  if (s.remediation !== null) {
    if (!first?.result || first.result.passed || !exact(s.remediation, ['courseKey', 'contentDigest', 'runtime'])) fail('history_invalid');
    child = sealedFinal(definition, course, first);
    if (child.id !== s.remediation.courseKey || child.digest !== s.remediation.contentDigest) fail('content_changed');
    validateReview(s.remediation.runtime, child, actor, enrollment, c.serverTimeMs);
  }
  const expectedPhase = !first ? 'source' : first.answers === null ? 'first_assessment' : first.result.passed ? 'passed'
    : !s.remediation ? 'remediation_required' : !second ? 'remediation' : second.answers === null ? 'second_assessment'
      : second.result.passed ? 'passed' : 'staff_review_required';
  if (s.phase !== expectedPhase || !first && s.remediation !== null || second && s.remediation?.runtime.status !== 'review_complete') fail('history_invalid');
  return { state: s, child };
}

// Administrative projection reuses the learner runtime's full history validation.
// It deliberately returns neither lesson bodies, item IDs, selections nor answers.
export function nmlsAdministrativeProgress(row, enrollment, now = Date.now()) {
  const course = getNmlsReviewCourse(NMLS_TRAINING_SOURCE_KEY);
  const definition = trainingDefinition(NMLS_TRAINING_SOURCE_KEY);
  if (row.enrollment_id !== enrollment.id || row.student_id !== enrollment.student_id ||
      enrollment.course_id !== NMLS_TRAINING_COURSE_ID || enrollment.course_version !== NMLS_TRAINING_COURSE_VERSION ||
      enrollment.state !== 'US' || enrollment.enrollment_origin !== 'training' ||
      enrollment.compliance_credit_eligible !== false) fail('scope_mismatch');
  const { state: s } = contextState({ studentId: row.student_id, enrollmentId: row.enrollment_id,
    courseId: row.course_id, courseVersion: row.course_version, reviewRole: enrollment.review_role ?? null,
    contentDigest: NMLS_TRAINING_COURSE.contentDigest, definitionDigest: definition.digest,
    revision: row.revision, runtime: row.runtime, event: null, serverTimeMs: now },
  enrollment.student_id, enrollment.id, course, definition);
  const source = s?.source;
  const remediation = s?.remediation?.runtime;
  return {
    adapter: 'nmls_training', available: true, phase: s?.phase || 'not_started',
    courseVersion: row.course_version, revision: row.revision,
    completed: source?.completedUnitIds.length || 0, total: course.modules.reduce((n, m) => n + m.units.length, 0),
    unit: 'lessons', completedModules: source?.passedModuleIds.length || 0, totalModules: course.modules.length,
    modules: course.modules.map(m => ({ id: m.id, title: m.title, completed: source?.passedModuleIds.includes(m.id) || false,
      completedLessons: m.units.filter(u => source?.completedUnitIds.includes(u.id)).length, totalLessons: m.units.length })),
    assessments: (s?.finals || []).map((f, i) => ({ attempt: i + 1,
      status: f.result ? f.result.passed ? 'passed' : 'failed' : 'in_progress',
      correct: f.result?.correct ?? null, total: f.result?.total ?? null })),
    remediation: { status: s?.phase === 'remediation_required' ? 'required' : remediation?.status || 'not_required',
      completedLessons: remediation?.completedUnitIds.length ?? null, completedModules: remediation?.passedModuleIds.length ?? null },
    trainingCompleted: s?.phase === 'passed', creditEligible: false, certificateEligible: false,
    safetyGate: 'Free-training runtime cannot issue NMLS credit, certificates or reporting.',
    reviewerRole: enrollment.review_role || null, readOnly: enrollment.review_role === 'regulator_reviewer',
    lastActivity: row.revision > 0 && Number.isFinite(Date.parse(row.updated_at)) ? row.updated_at : null,
    source: 'nmls_training_attempts; validated against pinned course and assessment definitions',
  };
}

function publicResult(result) {
  return result ? { passed: result.passed, correct: result.correct, total: result.total, percent: result.percent,
    requiredCorrect: result.requiredCorrect, disposition: result.disposition,
    remediation: result.remediation.map(m => ({ moduleId: m.moduleId, title: m.title, unitIds: [...m.unitIds] })) } : null;
}
function publicFeedback(feedback) {
  if (feedback === null) return null;
  if (!plain(feedback)) fail('history_invalid');
  const item = value => {
    if (!plain(value) || typeof value.questionId !== 'string' || typeof value.correct !== 'boolean' ||
      typeof value.rationale !== 'string' || !Array.isArray(value.sourceUrls) || value.sourceUrls.some(url => typeof url !== 'string')) fail('history_invalid');
    return { questionId: value.questionId, correct: value.correct, rationale: value.rationale, sourceUrls: [...value.sourceUrls] };
  };
  if (feedback.kind === 'module_quiz') {
    if (!integer(feedback.correct) || !integer(feedback.total) || feedback.correct > feedback.total ||
      typeof feedback.passed !== 'boolean' || !Array.isArray(feedback.items) || feedback.items.length !== feedback.total) fail('history_invalid');
    return { kind: 'module_quiz', correct: feedback.correct, total: feedback.total, passed: feedback.passed, items: feedback.items.map(item) };
  }
  return item(feedback);
}
function regulatorProjection(c, course, definition) {
  // Allowlist every field: authoring objects contain private correctChoice and
  // rationales. Reviewers inspect this one course, never another student's
  // history, protected assessment selections, answer keys or teaching leases.
  const question = q => ({ id: q.id, stem: q.stem, options: q.options.map(o => ({ id: o.id, text: o.text })) });
  return { mode: 'free_training', accessMode: 'regulator_reviewer', readOnly: true,
    creditIssuanceAllowed: false, nmlsCreditEligible: false, courseCompletionIssued: false,
    enrollmentId: c.enrollmentId, course: { id: c.courseId, version: c.courseVersion, title: 'Mortgage course — read-only review' },
    revision: c.revision, phase: 'read_only_review', code: 'training_review_snapshot', replayed: false,
    progress: null, assessment: null, result: null,
    review: { notice: `Read-only, course-scoped reviewer access. No student activity or grades are recorded. ${notice}`,
      modules: course.modules.map(m => ({ id: m.id, title: m.title,
        lessons: m.units.map(u => ({ id: u.id, title: u.title, content: u.content, question: question(u.actionQuestion) })),
        formativeQuestions: m.quiz.bank.map(question) })),
      assessmentRules: { questionCount: definition.questionCount, bankCount: definition.items.length,
        maxAutomaticAttempts: definition.maxAutomaticAttempts,
        requiredCorrect: Math.ceil(definition.questionCount * definition.passPercent / 100), remediationRequired: true } } };
}
function projection(c, course, definition, validated, code, replayed) {
  const { state: s, child } = validated;
  const activeReview = s?.phase === 'remediation' ? s.remediation.runtime : s?.source || startNmlsCourseReview(course);
  const activeCourse = s?.phase === 'remediation' ? child : course;
  const progress = projectNmlsReview(activeReview, activeCourse);
  // Explicit projection; no editorial state, answers, final rationales, private
  // question selection structure or claims of CE minutes can escape.
  const teaching = !s || ['source', 'remediation'].includes(s.phase);
  const readOnly = code === 'training_snapshot' || replayed;
  const expired = progress.status === 'active' && c.serverTimeMs - activeReview.lastActivityMs >= REVIEW_POLICY.idleLogoutMs;
  // A snapshot or retry is not an explicit acquisition of a teaching lease.
  // Never disclose the current device's lease to another tab through a read or
  // an old event. Reads also stop exposure at the idle boundary without writing
  // a logout or changing saved work; the reducer persists that on the next act.
  const exposeTeaching = teaching && progress.status === 'active' && !readOnly && !expired;
  const safeProgress = { mode: 'free_training', title: activeCourse === course ? 'Mortgage professional training' : 'Targeted mortgage practice',
    revision: progress.revision, status: expired && teaching ? 'logged_out' : progress.status, sessionId: exposeTeaching ? progress.sessionId : null,
    completedUnitIds: [...progress.completedUnitIds], passedModuleIds: [...progress.passedModuleIds],
    completedPracticeMs: progress.completedReviewMs, provisionalPracticeMs: exposeTeaching ? progress.provisionalReviewMs : 0,
    currentUnitId: exposeTeaching ? progress.currentUnitId : null,
    resumeRequired: teaching && progress.status !== 'review_complete' && (readOnly || expired || progress.resumeRequired || progress.status === 'logged_out'),
    currentUnitActionComplete: exposeTeaching && progress.currentUnitActionComplete, modules: progress.modules,
    lessons: exposeTeaching ? progress.lessons : [], quiz: exposeTeaching ? progress.quiz : null,
    feedback: teaching && !readOnly && !expired ? publicFeedback(progress.feedback) : null, notice };
  const final = s?.finals.at(-1);
  const assessment = final?.answers === null && ['first_assessment', 'second_assessment'].includes(s.phase)
    ? (() => { const p = projectNmlsDraftFinal(definition, final.selection); return { id: p.attemptId, number: p.attemptNumber, questions: p.questions }; })() : null;
  return { mode: 'free_training', accessMode: c.reviewRole || 'student', readOnly: false,
    creditIssuanceAllowed: false, nmlsCreditEligible: false, courseCompletionIssued: false,
    enrollmentId: c.enrollmentId, course: { id: c.courseId, version: c.courseVersion, title: 'Mortgage professional training — free, non-credit' },
    revision: c.revision, phase: s?.phase || 'not_started', code, replayed, progress: safeProgress, assessment,
    result: publicResult(final?.result) };
}

export async function executeNmlsTraining(input, studentId, { rpc, courseFor = getNmlsReviewCourse,
  definitionFor = trainingDefinition, newId = randomUUID } = {}) {
  const value = validateNmlsTrainingInput(input);
  if (!uuid(studentId)) fail('authentication_required');
  studentId = studentId.toLowerCase();
  if (typeof rpc !== 'function' || typeof courseFor !== 'function' || typeof definitionFor !== 'function' || typeof newId !== 'function') fail('unavailable');
  const { operation, command: commandInput } = value, enrollment = commandInput.enrollmentId;
  const course = courseFor(NMLS_TRAINING_SOURCE_KEY), definition = definitionFor(NMLS_TRAINING_SOURCE_KEY);
  const commandDigest = digestNmlsCommand(value);
  // Exactly one retry, only for SQL's explicit pre/post-write clock rejection.
  // Unknown network errors are not retried and never manufacture a new event.
  for (let retry = 0; retry < 2; retry++) {
    const c = await rpc('nmls_training_context', { p_student_id: studentId, p_enrollment_id: enrollment,
      p_event_id: operation === 'snapshot' ? null : commandInput.eventId });
    const validated = contextState(c, studentId, enrollment, course, definition);
    if (c.reviewRole === 'regulator_reviewer') {
      if (operation !== 'snapshot') fail('read_only');
      return { status: 200, body: regulatorProjection(c, course, definition) };
    }
    if (operation === 'snapshot') return { status: 200, body: projection(c, course, definition, validated, 'training_snapshot', false) };
    let runtime = null, audit = null, status = 200, code = 'training_state_saved';
    if (!c.event && c.revision === commandInput.expectedRevision) {
      runtime = structuredClone(validated.state || { schema: SCHEMA, purpose: 'free_training', courseId: c.courseId,
        courseVersion: c.courseVersion, sourceCourseKey: course.id, contentDigest: course.digest, definitionDigest: definition.digest,
        revision: 0, phase: 'source', source: startNmlsCourseReview(course), remediation: null, finals: [] });
      const fromPhase = runtime.phase; let detail = null, ok = true;
      if (operation === 'teaching') {
        if (!['source', 'remediation'].includes(runtime.phase)) fail('phase_conflict');
        if (!validated.state && commandInput.action.kind !== 'resume') fail('resume_required');
        const currentCourse = runtime.phase === 'source' ? course : validated.child;
        const current = runtime.phase === 'source' ? runtime.source : runtime.remediation.runtime;
        const action = { ...commandInput.action, attemptId: enrollment, eventId: commandInput.eventId, expectedRevision: current.revision };
        const reduced = reduceNmlsReview(current, action, currentCourse, c.serverTimeMs,
          { newId, continuity: continuity(studentId, enrollment, currentCourse) });
        if (runtime.phase === 'source') runtime.source = reduced.state; else runtime.remediation.runtime = reduced.state;
        ({ code, status, ok } = reduced.outcome); detail = reduced.audit;
      } else if (operation === 'issue_assessment') {
        if (!['source', 'remediation'].includes(runtime.phase)) fail('phase_conflict');
        requireNmlsFinalReviewCompletion(definition, runtime.source);
        const first = runtime.finals[0];
        const selection = drawNmlsDraftFinal(definition, { id: newId(), reviewAttemptId: enrollment, reviewState: runtime.source,
          previous: first ? { attempt: first.selection, answers: first.answers, remediationState: runtime.remediation.runtime } : null }, { course });
        runtime.finals.push({ selection, answers: null, result: null });
        runtime.phase = first ? 'second_assessment' : 'first_assessment'; code = 'training_assessment_issued';
      } else if (operation === 'submit_assessment') {
        if (!['first_assessment', 'second_assessment'].includes(runtime.phase)) fail('phase_conflict');
        const final = runtime.finals.at(-1);
        if (final.selection.id !== commandInput.assessmentId) fail('assessment_scope');
        final.result = gradeNmlsDraftFinal(definition, final.selection, commandInput.answers);
        final.answers = structuredClone(commandInput.answers);
        runtime.phase = final.result.passed ? 'passed' : final.selection.number === 1 ? 'remediation_required' : 'staff_review_required';
        code = 'training_assessment_submitted';
      } else {
        if (runtime.phase !== 'remediation_required') fail('phase_conflict');
        const first = runtime.finals[0], child = makeNmlsFinalRemediationCourse(definition, course, first.selection, first.answers);
        runtime.remediation = { courseKey: child.id, contentDigest: child.digest, runtime: startNmlsCourseReview(child) };
        runtime.phase = 'remediation'; code = 'training_remediation_started';
      }
      runtime.revision = c.revision + 1;
      audit = { schema: 'nmls-free-training-event-v1', operation, eventId: commandInput.eventId, atMs: c.serverTimeMs,
        code, status, ok, fromPhase, toPhase: runtime.phase, expectedRevision: c.revision, resultingRevision: runtime.revision, detail };
      contextState({ ...c, runtime, revision: runtime.revision }, studentId, enrollment, course, definition);
    }
    let committed;
    try {
      committed = await rpc('nmls_training_commit', { p_student_id: studentId, p_enrollment_id: enrollment,
        p_event_id: commandInput.eventId, p_command_digest: commandDigest, p_expected_revision: commandInput.expectedRevision,
        p_evaluated_at_ms: c.serverTimeMs, p_runtime: runtime, p_audit: audit });
    } catch (error) {
      if (retry === 0 && Object.getOwnPropertyDescriptor(error || {}, 'message')?.value === 'nmls_training_clock_refresh_required') continue;
      throw error;
    }
    const saved = contextState(committed, studentId, enrollment, course, definition);
    if (typeof committed.replayed !== 'boolean' || !committed.event || committed.event.command_digest !== commandDigest ||
      !committed.replayed && (!runtime || !same(committed.runtime, runtime))) fail('history_invalid');
    // Replays project the currently authorized persisted state, NOT historical
    // lessons/forms. No state is restored or redrawn from an old event response.
    return { status: committed.replayed ? 200 : status,
      body: projection(committed, course, definition, saved, committed.replayed ? 'training_replayed' : code, committed.replayed) };
  }
  fail('unavailable');
}

export function nmlsTrainingPublicError(error) {
  const descriptor = error && typeof error === 'object' ? Object.getOwnPropertyDescriptor(error, 'message') : null;
  const code = descriptor && Object.hasOwn(descriptor, 'value') && typeof descriptor.value === 'string' ? descriptor.value : '';
  const unauthorized = ['nmls_training_authentication_required', 'student_auth_required', 'invalid_student_session'];
  const forbidden = ['origin_not_allowed', 'nmls_training_access_denied', 'nmls_training_access_revoked', 'nmls_training_gate_closed', 'nmls_training_read_only'];
  const conflicts = ['nmls_training_revision_conflict', 'nmls_training_idempotency_conflict', 'nmls_training_content_changed',
    'nmls_training_phase_conflict', 'nmls_training_assessment_scope', 'nmls_training_resume_required', 'nmls_training_clock_refresh_required',
    'nmls_training_event_conflict', 'nmls_training_phase_closed', 'nmls_training_scope_mismatch',
    'nmls_review_session_conflict', 'nmls_review_revision_conflict', 'nmls_final_review_prerequisites'];
  const status = unauthorized.includes(code) ? 401 : code === 'nmls_training_invalid_request' || code === 'nmls_final_invalid_answers' ? 400
    : forbidden.includes(code) ? 403 : conflicts.includes(code) ? 409 : 503;
  return { status, body: { error: status === 503 ? 'nmls_training_unavailable' : code } };
}
