import { createHash, randomInt } from 'node:crypto';
import { NMLS_OSS_REQUIREMENTS as R, NMLS_OSS_DESIGN as D } from '../config/nmls/oss-policy.mjs';

// PRIVATE AUTHORING DOMAIN ONLY. No HTTP route, student entitlement, persistence,
// identity/ROCS claim, observed time, certificate or credit is implemented here.
// The caller must keep definition, attempt records and submitted answers private.
const fail = (reason) => { throw new Error(`nmls_final_${reason}`); };
const plain = value => Boolean(value && Object.getPrototypeOf(value) === Object.prototype);
const unique = values => new Set(values).size === values.length;
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const canonical = value => Array.isArray(value) ? value.map(canonical) : plain(value)
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
const digest = value => createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
const frozen = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(frozen); Object.freeze(value); }
  return value;
};
const sameSet = (left, right) => Array.isArray(left) && unique(left) && left.length === right.length && right.every(id => left.includes(id));
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const unitsOf = course => course.modules.flatMap(module => module.units.map(unit => ({ id: unit.id, title: unit.title, moduleId: module.id })));

function shuffle(values, draw) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = draw(i + 1);
    if (!Number.isSafeInteger(j) || j < 0 || j > i) fail('invalid_random_draw');
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function inspectNmlsFinalCandidates(course, items) {
  if (!Array.isArray(items) || !items.length || !unique(items.map(item => item.id))) fail('invalid_candidates');
  const units = unitsOf(course);
  const moduleIds = course.modules.map(module => module.id);
  const formative = course.modules.flatMap(module => [...module.quiz.bank, ...module.units.map(unit => unit.actionQuestion)]);
  const existingStems = new Set(formative.map(item => normalize(item.stem)));
  const existingIds = new Set(formative.map(item => item.id));
  const finalStems = new Set();
  const keyCounts = { A: 0, B: 0, C: 0, D: 0 };
  const uniquelyLongestCorrect = []; const uniquelyShortestCorrect = [];
  for (const item of items) {
    if (!plain(item) || !/^N26-FIN-[FENG]\d{2}$/.test(item.id) || existingIds.has(item.id) ||
        !moduleIds.includes(item.moduleId) || !nonempty(item.objective) || !nonempty(item.stem) ||
        !nonempty(item.rationale) || !nonempty(item.independenceNote) || !Array.isArray(item.options) ||
        item.options.length !== 4 || !sameSet(item.options.map(option => option.id), ['A', 'B', 'C', 'D']) ||
        item.options.some(option => !nonempty(option.text)) || !unique(item.options.map(option => normalize(option.text))) ||
        !Object.hasOwn(keyCounts, item.correctChoice)) fail('invalid_item');
    const expectedCategory = { F: 'federal', E: 'ethics', N: 'nontraditional', G: 'general' }[item.moduleId[0]];
    if (item.category !== expectedCategory || item.id[8] !== item.moduleId[0]) fail('category_mismatch');
    const stem = normalize(item.stem);
    if (existingStems.has(stem) || finalStems.has(stem)) fail('reused_stem');
    finalStems.add(stem);
    const wrong = item.options.filter(option => option.id !== item.correctChoice).map(option => option.id);
    if (!plain(item.distractorRationales) || !sameSet(Object.keys(item.distractorRationales), wrong) ||
        wrong.some(id => !nonempty(item.distractorRationales[id]))) fail('invalid_distractor_rationales');
    if (!plain(item.remediation) || !nonempty(item.remediation.focus) || !Array.isArray(item.remediation.unitIds) ||
        !item.remediation.unitIds.length || !unique(item.remediation.unitIds) ||
        item.remediation.unitIds.some(id => !units.some(unit => unit.id === id))) fail('invalid_remediation');
    if (!Array.isArray(item.sourceRefs) || !item.sourceRefs.length) fail('missing_sources');
    for (const source of item.sourceRefs) {
      let url; try { url = new URL(source.url); } catch { fail('invalid_source'); }
      if (url.protocol !== 'https:' || url.username || url.password ||
          !nonempty(source.locator) || !nonempty(source.supports) || !/^2026-\d{2}-\d{2}$/.test(source.checkedOn)) fail('invalid_source');
    }
    keyCounts[item.correctChoice]++;
    const lengths = item.options.map(option => ({ id: option.id, count: option.text.trim().split(/\s+/).length }));
    const chosen = lengths.find(option => option.id === item.correctChoice).count;
    if (lengths.filter(option => option.count >= chosen).length === 1) uniquelyLongestCorrect.push(item.id);
    if (lengths.filter(option => option.count <= chosen).length === 1) uniquelyShortestCorrect.push(item.id);
  }
  // Diagnostics, NOT proof of independence, accuracy, human review or approval.
  return { count: items.length, keyCounts, uniquelyLongestCorrect, uniquelyShortestCorrect,
    semanticIndependenceVerified: false, legalAccuracyVerified: false, humanReviewed: false };
}

export function defineNmlsDraftFinal(course, { id, items, moduleQuotas }) {
  if (course.mode !== 'non_credit_review' || course.salesAuthorized !== false || course.approvalId !== null ||
      !/^[a-f0-9]{64}$/.test(course.digest) || !nonempty(id) || !plain(moduleQuotas) ||
      !sameSet(Object.keys(moduleQuotas), course.modules.map(module => module.id)) ||
      Object.values(moduleQuotas).some(count => !Number.isSafeInteger(count) || count < 1) ||
      Object.values(moduleQuotas).reduce((sum, count) => sum + count, 0) !== D.defaultFinalQuestions ||
      D.defaultFinalQuestions < R.finalLongMinQuestions) fail('invalid_blueprint');
  const diagnostics = inspectNmlsFinalCandidates(course, items);
  if (items.length !== D.defaultFinalQuestions * R.bankRatio || course.modules.some(module =>
    items.filter(item => item.moduleId === module.id).length !== moduleQuotas[module.id] * R.bankRatio)) fail('bank_ratio');
  const definition = { schema: 'statecourse-nmls-draft-final-v1', id, year: 2026,
    courseKey: course.id, contentDigest: course.digest, sourcePayloadDigest: digest(course),
    questionCount: D.defaultFinalQuestions, passPercent: R.finalMinPassPercent,
    assignedCreditSeconds: D.finalCreditSeconds, maxAutomaticAttempts: 2,
    mode: 'private_authoring_review', studentDeliveryEnabled: false,
    salesAuthorized: false, creditIssuanceAllowed: false, humanReviewed: false,
    moduleQuotas: structuredClone(moduleQuotas),
    modules: course.modules.map(module => ({ id: module.id, title: module.title })),
    units: unitsOf(course), items: structuredClone(items), diagnostics };
  return frozen({ ...definition, digest: digest(definition) });
}

function validateDefinition(definition) {
  if (!plain(definition)) fail('definition_changed');
  const { digest: expected, ...value } = definition;
  if (digest(value) !== expected || definition.schema !== 'statecourse-nmls-draft-final-v1' ||
      definition.mode !== 'private_authoring_review' || definition.studentDeliveryEnabled !== false ||
      definition.creditIssuanceAllowed !== false || definition.salesAuthorized !== false || definition.humanReviewed !== false ||
      definition.assignedCreditSeconds !== 0 || definition.year !== 2026 || definition.questionCount !== 25 ||
      definition.passPercent !== 70 || definition.maxAutomaticAttempts !== 2 ||
      !/^[a-f0-9]{64}$/.test(definition.contentDigest) || !/^[a-f0-9]{64}$/.test(definition.sourcePayloadDigest) ||
      !nonempty(definition.id) || !nonempty(definition.courseKey) ||
      !Array.isArray(definition.modules) || !definition.modules.length || !unique(definition.modules.map(module => module.id)) ||
      definition.modules.some(module => !/^[FENG]\d{2}$/.test(module.id) || !nonempty(module.title)) ||
      !plain(definition.moduleQuotas) || !sameSet(Object.keys(definition.moduleQuotas), definition.modules.map(module => module.id)) ||
      Object.values(definition.moduleQuotas).some(count => !Number.isSafeInteger(count) || count < 1) ||
      Object.values(definition.moduleQuotas).reduce((sum, count) => sum + count, 0) !== 25 ||
      !Array.isArray(definition.units) || !unique(definition.units.map(unit => unit.id)) ||
      definition.units.some(unit => !nonempty(unit.title) || !definition.modules.some(module => module.id === unit.moduleId))) fail('definition_changed');
  const sourceTopology = { modules: definition.modules.map(module => ({ ...module, quiz: { bank: [] },
    units: definition.units.filter(unit => unit.moduleId === module.id).map(unit => ({ ...unit, actionQuestion: { id: '', stem: '' } })) })) };
  if (sourceTopology.modules.some(module => !module.units.length)) fail('definition_changed');
  inspectNmlsFinalCandidates(sourceTopology, definition.items);
  if (definition.items.length !== 50 || definition.modules.some(module => definition.items.filter(item => item.moduleId === module.id).length !==
      2 * definition.moduleQuotas[module.id])) fail('definition_changed');
}

function validateAttempt(definition, attempt) {
  if (!plain(attempt) || attempt.schema !== 'statecourse-nmls-draft-final-attempt-v1' || !uuid(attempt.id) ||
      !uuid(attempt.reviewAttemptId) || attempt.definitionDigest !== definition.digest ||
      ![1, 2].includes(attempt.number) || !Array.isArray(attempt.questionIds) ||
      attempt.questionIds.length !== definition.questionCount || !unique(attempt.questionIds) ||
      !plain(attempt.optionOrder) || !sameSet(Object.keys(attempt.optionOrder), attempt.questionIds)) fail('invalid_attempt');
  for (const id of attempt.questionIds) {
    if (!definition.items.some(item => item.id === id) || !sameSet(attempt.optionOrder[id], ['A', 'B', 'C', 'D'])) fail('invalid_attempt');
  }
  for (const [moduleId, count] of Object.entries(definition.moduleQuotas)) {
    if (attempt.questionIds.filter(id => definition.items.find(item => item.id === id).moduleId === moduleId).length !== count) fail('invalid_attempt');
  }
}

function requireCompletedReview(reviewState, courseKey, contentDigest, units, modules) {
  if (!plain(reviewState) || reviewState.courseKey !== courseKey || reviewState.contentDigest !== contentDigest ||
      reviewState.mode !== 'non_credit_review' || reviewState.creditIssuanceAllowed !== false ||
      reviewState.status !== 'review_complete' || reviewState.current || reviewState.quiz || reviewState.bookmark || reviewState.quizReservation ||
      !sameSet(reviewState.completedUnitIds, units.map(unit => unit.id)) ||
      !sameSet(reviewState.passedModuleIds, modules.map(module => module.id))) fail('review_prerequisites');
}

export function requireNmlsFinalReviewCompletion(definition, reviewState) {
  validateDefinition(definition);
  requireCompletedReview(reviewState, definition.courseKey, definition.contentDigest, definition.units, definition.modules);
}

export function makeNmlsFinalRemediationCourse(definition, course, attempt, answers) {
  validateDefinition(definition); validateAttempt(definition, attempt);
  if (attempt.number !== 1 || course?.id !== definition.courseKey || course?.digest !== definition.contentDigest ||
      digest(course) !== definition.sourcePayloadDigest) fail('remediation_scope');
  const grade = gradeNmlsDraftFinal(definition, attempt, answers);
  if (grade.passed) fail('already_passed');
  const moduleIds = grade.remediation.map(entry => entry.moduleId);
  const remediation = { id: `${course.id}-remediation-${attempt.id}`,
    title: 'Private final review — targeted module practice', mode: 'non_credit_review',
    salesAuthorized: false, approvalId: null,
    modules: structuredClone(course.modules.filter(module => moduleIds.includes(module.id))),
    editorial: { completeCourse: false, finalExamIncluded: false, validatedDuration: false,
      sourceCourseKey: course.id, sourceCourseDigest: course.digest, definitionDigest: definition.digest,
      finalAttemptId: attempt.id, reviewAttemptId: attempt.reviewAttemptId,
      studentDeliveryEnabled: false, creditIssuanceAllowed: false,
      notice: 'Provider-selected draft remediation. Reuses taught lessons and formative practice, not final answers. No new CE credit.' } };
  return frozen({ ...remediation, digest: digest(remediation) });
}

export function drawNmlsDraftFinal(definition, { id, reviewAttemptId, reviewState, previous = null }, { draw = randomInt, course = null } = {}) {
  validateDefinition(definition);
  if (!uuid(id) || !uuid(reviewAttemptId)) fail('invalid_attempt_id');
  // These checks use persisted review-state shapes. They do NOT assert all
  // regulatory prerequisites: ROCS/BioSig/observations remain release holds.
  requireNmlsFinalReviewCompletion(definition, reviewState);
  let excluded = [];
  if (previous) {
    validateAttempt(definition, previous.attempt);
    if (previous.attempt.reviewAttemptId !== reviewAttemptId || previous.attempt.id === id) fail('attempt_scope');
    if (previous.attempt.number >= definition.maxAutomaticAttempts) fail('staff_review_required');
    const grade = gradeNmlsDraftFinal(definition, previous.attempt, previous.answers);
    if (grade.passed) fail('already_passed');
    const remediation = makeNmlsFinalRemediationCourse(definition, course, previous.attempt, previous.answers);
    // A click/acknowledgment or the original completed course cannot clear this
    // requirement. The existing unit/quiz evaluator must finish a separately
    // pinned remediation review. HTTP/auth/CAS integration is not yet present.
    requireCompletedReview(previous.remediationState, remediation.id, remediation.digest, unitsOf(remediation), remediation.modules);
    excluded = previous.attempt.questionIds;
  }
  const selected = Object.entries(definition.moduleQuotas).flatMap(([moduleId, count]) => {
    const pool = definition.items.filter(item => item.moduleId === moduleId && !excluded.includes(item.id)).map(item => item.id);
    if (pool.length < count) fail('insufficient_fresh_items');
    return shuffle(pool, draw).slice(0, count);
  });
  const questionIds = shuffle(selected, draw);
  const attempt = { schema: 'statecourse-nmls-draft-final-attempt-v1', id, reviewAttemptId,
    definitionDigest: definition.digest, number: previous ? 2 : 1, questionIds,
    optionOrder: Object.fromEntries(questionIds.map(id => [id, shuffle(['A', 'B', 'C', 'D'], draw)])) };
  validateAttempt(definition, attempt);
  return frozen(attempt);
}

export function projectNmlsDraftFinal(definition, attempt) {
  validateDefinition(definition); validateAttempt(definition, attempt);
  return { mode: 'private_authoring_review', studentDeliveryEnabled: false, creditIssuanceAllowed: false,
    attemptId: attempt.id, attemptNumber: attempt.number,
    questions: attempt.questionIds.map(id => {
      const item = definition.items.find(item => item.id === id);
      return { id, stem: item.stem, options: attempt.optionOrder[id].map(choice =>
        ({ id: choice, text: item.options.find(option => option.id === choice).text })) };
    }) };
}

export function gradeNmlsDraftFinal(definition, attempt, answers) {
  validateDefinition(definition); validateAttempt(definition, attempt);
  if (!plain(answers) || !sameSet(Object.keys(answers), attempt.questionIds) ||
      Object.values(answers).some(value => typeof value !== 'string' || !['A', 'B', 'C', 'D'].includes(value))) fail('invalid_answers');
  const missed = attempt.questionIds.map(id => definition.items.find(item => item.id === id))
    .filter(item => item.correctChoice !== answers[item.id]);
  const correct = definition.questionCount - missed.length;
  const passed = correct * 100 >= definition.passPercent * definition.questionCount;
  const supportingUnits = new Set(missed.flatMap(item => item.remediation.unitIds));
  const missedModules = definition.modules.filter(module => missed.some(item => item.moduleId === module.id) ||
    definition.units.some(unit => unit.moduleId === module.id && supportingUnits.has(unit.id)));
  // Broad module review avoids revealing which individual final item was missed.
  // Exact keys/rationales stay private for qualified reviewer use, including pass.
  return { mode: 'private_authoring_review', passed, correct, total: definition.questionCount,
    percent: correct * 100 / definition.questionCount, requiredCorrect: Math.ceil(definition.questionCount * definition.passPercent / 100),
    assignedCreditSeconds: 0, creditIssuanceAllowed: false, courseCompletionIssued: false,
    disposition: passed ? 'draft_final_passed' : attempt.number < definition.maxAutomaticAttempts ? 'remediation_required' : 'staff_review_required',
    remediation: passed ? [] : missedModules.map(module => ({ moduleId: module.id, title: module.title,
      unitIds: definition.units.filter(unit => unit.moduleId === module.id).map(unit => unit.id),
      instruction: 'Revisit this module and its practice before another final review. This result does not verify remediation completion.' })) };
}
