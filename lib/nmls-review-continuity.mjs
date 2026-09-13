// Server-private continuity, scoped to the original actor/attempt/offering and
// source. These records are never learner projections or client replacement
// state. The observed composer alone grants clean save / permitted restore.
const VERSION = 'nmls-review-continuity-v1';
const exact = (o, keys) => o && typeof o === 'object' && !Array.isArray(o) &&
  Object.keys(o).length === keys.length && keys.every(k => Object.hasOwn(o, k));
const text = x => typeof x === 'string' && x.length > 0;
const integer = n => Number.isSafeInteger(n) && n >= 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fail = () => { throw new Error('nmls_review_continuity_invalid'); };
const scopeKeys = ['actorId', 'attemptId', 'offeringId', 'courseKey', 'contentDigest'];
const unitsOf = course => course.modules.flatMap(m => m.units);

// Shared source-bound shape check for an active unit and a saved active unit.
// This validates requirements/progress bounds, not the provenance of attendance.
export function validateNmlsCurrentUnit(state, course, c, ceilingMs) {
  const u = unitsOf(course).find(x => !state.completedUnitIds.includes(x.id));
  const moduleIndex = course.modules.findIndex(m => m.units.some(x => x.id === u?.id));
  if (!u || c.unitId !== u.id || state.quizReservation ||
      course.modules.slice(0, moduleIndex).some(m => !state.passedModuleIds.includes(m.id)) ||
      c.mode !== 'non_credit_review' || c.creditIssuanceAllowed !== false || c.status !== 'active' ||
      !text(c.attemptId) || !text(c.sessionId) || c.requiredMs !== u.requiredSeconds * 1000 ||
      !same(c.requiredActionIds, u.requiredActionIds) || !Array.isArray(c.completedActionIds) ||
      new Set(c.completedActionIds).size !== c.completedActionIds.length ||
      !c.completedActionIds.every(id => c.requiredActionIds.includes(id)) ||
      !integer(c.provisionalMs) || c.provisionalMs > c.requiredMs || c.completedMs !== 0 ||
      !integer(c.revision) || !integer(c.openedAtMs) || !integer(c.lastReceiptMs) || !integer(c.lastActivityMs) ||
      c.openedAtMs > c.lastActivityMs || c.lastActivityMs > c.lastReceiptMs || c.lastReceiptMs > ceilingMs ||
      typeof c.previousEngaged !== 'boolean' || !Array.isArray(c.processedEventIds) || !Array.isArray(c.audit)) fail();
}

export function validateNmlsReviewContinuity(state, course, control, at) {
  if (!control) {
    if (state.bookmark || state.quizReservation) fail(); // no legacy bypass
    return;
  }
  if (!exact(control, ['scope', 'saveAllowed', 'restoreAllowed']) ||
      !exact(control.scope, scopeKeys) || !scopeKeys.every(k => text(control.scope[k])) ||
      control.scope.courseKey !== course.id || control.scope.contentDigest !== course.digest ||
      typeof control.saveAllowed !== 'boolean' || typeof control.restoreAllowed !== 'boolean') fail();
  const envelope = (value, keys) => {
    if (!exact(value, ['version', 'scope', ...keys]) || value.version !== VERSION ||
        !exact(value.scope, scopeKeys) || !scopeKeys.every(k => value.scope[k] === control.scope[k])) fail();
  };
  if (state.quizReservation) {
    envelope(state.quizReservation, ['quiz']);
    const q = state.quizReservation.quiz, m = course.modules.find(x => !state.passedModuleIds.includes(x.id));
    if (!exact(q, ['id', 'moduleId', 'questionIds']) || !text(q.id) || !m || q.moduleId !== m.id ||
        !m.units.every(u => state.completedUnitIds.includes(u.id)) || !Array.isArray(q.questionIds) ||
        q.questionIds.length !== m.quiz.questionsPerAttempt || new Set(q.questionIds).size !== q.questionIds.length ||
        !q.questionIds.every(id => m.quiz.bank.some(item => item.id === id)) ||
        state.quiz && (q.id !== state.quiz.id || q.moduleId !== state.quiz.moduleId ||
          !same(q.questionIds, state.quiz.questionIds))) fail();
  } else if (state.quiz) {
    // Historical quizzes from the uninstrumented runtime are not silently
    // promoted into a fresh observed attempt with reset selection history.
    fail();
  }
  if (state.bookmark) {
    const b = state.bookmark;
    envelope(b, ['savedAtMs', 'current', 'quizId']);
    if (!integer(b.savedAtMs) || b.savedAtMs > at || state.current || state.quiz ||
        (b.current === null) === (b.quizId === null)) fail();
    if (b.quizId !== null && b.quizId !== state.quizReservation?.quiz.id) fail();
    if (b.current !== null) validateNmlsCurrentUnit(state, course, b.current, b.savedAtMs);
  }
}

const wrap = (scope, values) => ({ version: VERSION, scope: structuredClone(scope), ...values });

export function saveNmlsReviewBookmark(state, control, at) {
  if (!control?.saveAllowed || (!state.current && !state.quiz)) return null;
  state.bookmark = wrap(control.scope, { savedAtMs: at, current: structuredClone(state.current), quizId: state.quiz?.id ?? null });
  return { unitId: state.current?.unitId ?? null, quizId: state.quiz?.id ?? null,
    savedProvisionalMs: state.current?.provisionalMs ?? 0 };
}

export function restoreNmlsReviewBookmark(state, control, at) {
  if (!control?.restoreAllowed || !state.bookmark) return null;
  const b = state.bookmark;
  if (b.current) state.current = { ...structuredClone(b.current), sessionId: state.sessionId,
    previousEngaged: false, lastReceiptMs: at, lastActivityMs: at };
  if (b.quizId) state.quiz = structuredClone(state.quizReservation.quiz);
  delete state.bookmark;
  return { unitId: state.current?.unitId ?? null, quizId: state.quiz?.id ?? null,
    restoredProvisionalMs: state.current?.provisionalMs ?? 0 };
}

export function reserveNmlsReviewQuiz(state, control) {
  if (control) state.quizReservation = wrap(control.scope, { quiz: structuredClone(state.quiz) });
}
