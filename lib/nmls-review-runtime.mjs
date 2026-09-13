import { randomUUID, randomInt } from 'node:crypto';
import { startNmlsUnitReview, applyNmlsUnitReviewEvent } from './nmls-oss-unit-ledger.mjs';
import { NMLS_OSS_REQUIREMENTS as R } from '../config/nmls/oss-policy.mjs';
import { validateNmlsReviewContinuity, saveNmlsReviewBookmark, restoreNmlsReviewBookmark,
  reserveNmlsReviewQuiz } from './nmls-review-continuity.mjs';

// Server-only domain service. Browser payloads never supply the clock, a grade,
// accumulated time, question key, actor, course manifest or replacement state.
export function startNmlsCourseReview(course) {
  return {
    mode: 'non_credit_review', creditIssuanceAllowed: false, courseKey: course.id,
    contentDigest: course.digest, revision: 0, status: 'logged_out', sessionId: null,
    lastActivityMs: null, lastReceiptMs: 0, completedUnitIds: [], completedReviewMs: 0,
    passedModuleIds: [], current: null, quiz: null, feedback: null,
  };
}

const unitsOf = (course) => course.modules.flatMap((m) => m.units.map((u) => ({ ...u, moduleId: m.id })));
const publicQuestion = (q) => ({ id: q.id, stem: q.stem, options: q.options });
const questionById = (course, id) => course.modules.flatMap((m) => m.quiz.bank).find((q) => q.id === id);

export function compactNmlsReviewOutcome(outcome) {
  const copy = structuredClone(outcome);
  if (copy.progress?.lessons) copy.progress.lessons = copy.progress.lessons.map(({ id }) => ({ id }));
  return copy;
}

export function hydrateNmlsReviewOutcome(outcome, course) {
  const copy = structuredClone(outcome);
  if (copy.progress?.lessons) copy.progress.lessons = copy.progress.lessons.map(({ id }) => {
    const unit = unitsOf(course).find((u) => u.id === id);
    if (!unit) throw new Error('nmls_review_content_changed');
    return { id, content: unit.content, question: publicQuestion(unit.actionQuestion) };
  });
  return copy;
}

export function projectNmlsReview(state, course) {
  const units = unitsOf(course);
  const accessible = units.filter((u) => state.completedUnitIds.includes(u.id) || state.current?.unitId === u.id);
  return {
    mode: 'non_credit_review', creditIssuanceAllowed: false,
    courseKey: course.id, title: course.title, contentDigest: course.digest,
    revision: state.revision, status: state.status, sessionId: state.sessionId,
    completedUnitIds: state.completedUnitIds, passedModuleIds: state.passedModuleIds,
    completedReviewMs: state.completedReviewMs, provisionalReviewMs: state.current?.provisionalMs || 0,
    currentUnitId: state.current?.unitId || null,
    resumeRequired: Boolean(state.bookmark),
    currentUnitActionComplete: Boolean(state.current && state.current.requiredActionIds.every((id) => state.current.completedActionIds.includes(id))),
    modules: course.modules.map((m) => ({ id: m.id, title: m.title,
      units: m.units.map((u) => ({ id: u.id, title: u.title, requiredSeconds: u.requiredSeconds })) })),
    lessons: accessible.map((u) => ({ id: u.id, content: u.content,
      question: publicQuestion(u.actionQuestion) })),
    quiz: state.quiz ? { id: state.quiz.id, moduleId: state.quiz.moduleId,
      questions: state.quiz.questionIds.map((id) => publicQuestion(questionById(course, id))) } : null,
    feedback: state.feedback,
    notice: 'Private development review. No NMLS credit, enrollment, certificate or course completion is issued. Time allocations are provisional and unvalidated.',
  };
}

function chooseQuestions(bank, count) {
  const ids = bank.map((q) => q.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = randomInt(i + 1); [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, count);
}

export function reduceNmlsReview(previous, command, course, serverTimeMs,
  { newId = randomUUID, selectQuestions = chooseQuestions, policyControl = null, policyCheck = false, continuity = null,
    initialMaterialAcknowledgment = false } = {}) {
  const state = structuredClone(previous);
  let audit = { kind: command.kind, atMs: serverTimeMs };
  const finish = (ok, code, status = ok ? 200 : 409) => {
    state.revision = previous.revision + 1;
    state.lastReceiptMs = serverTimeMs;
    return { state, audit, outcome: { ok, code, status, progress: projectNmlsReview(state, course) } };
  };
  if (!Number.isSafeInteger(serverTimeMs) || serverTimeMs < state.lastReceiptMs) throw new Error('nmls_review_invalid_server_clock');
  if (course.id !== state.courseKey || course.digest !== state.contentDigest) throw new Error('nmls_review_content_changed');
  if (command.expectedRevision !== previous.revision) throw new Error('nmls_review_revision_conflict');
  // A stale lease must not log out or mutate the new lease. Explicit resume is
  // fenced by the current revision but intentionally rotates a prior lease.
  if (command.kind !== 'resume' && command.sessionId !== state.sessionId) throw new Error('nmls_review_session_conflict');
  validateNmlsReviewContinuity(state, course, continuity, serverTimeMs);

  const invalidate = (reason) => {
    audit = { ...audit, reason, invalidatedMs: state.current?.provisionalMs || 0,
      invalidatedUnitId: state.current?.unitId || null, abandonedQuizId: state.quiz?.id || null };
    state.current = null; state.quiz = null; state.feedback = null;
    state.status = 'logged_out'; state.sessionId = null;
  };
  if (state.status === 'active' && serverTimeMs - state.lastActivityMs >= R.idleLogoutMs) {
    invalidate('idle_logout');
    // Persist first; client must explicitly resume in a separate request.
    return finish(false, 'course_logout_required', 401);
  }
  if (typeof initialMaterialAcknowledgment !== 'boolean') throw new Error('invalid_initial_acknowledgment');
  if (initialMaterialAcknowledgment && state.current) {
    // Trusted observer fence. Material replacement can occur between unit
    // heartbeats; no pre-ack interval may bridge into provisional unit time.
    // Do NOT refresh the human-activity clock or alter saved work/actions.
    state.current.previousEngaged = false;
    audit.initialMaterialAcknowledgment = true;
  }
  // Trusted composed-policy control, not a browser command. It uses the same
  // revision/lease/idle checks, without executing an unknown command or grading
  // a blocked answer. Stopping delivery invalidates the unfinished unit/quiz:
  // later engagement must never bridge a policy-denied interval into seat time.
  if (policyControl) {
    if (typeof policyControl.ok !== 'boolean' || typeof policyControl.code !== 'string' ||
        !Number.isInteger(policyControl.status)) throw new Error('invalid_policy_control');
    if (!['active', 'review_complete'].includes(state.status)) return finish(false, 'course_logout_required', 401);
    const saved = saveNmlsReviewBookmark(state, continuity, serverTimeMs);
    audit = { ...audit, reason: 'policy_delivery_stopped', invalidatedMs: state.current?.provisionalMs || 0,
      invalidatedUnitId: state.current?.unitId || null, abandonedQuizId: state.quiz?.id || null };
    if (saved) { audit.bookmarkSaved = saved; audit.invalidatedMs = 0; audit.invalidatedUnitId = null; audit.abandonedQuizId = null; }
    state.current = null; state.quiz = null; state.feedback = null;
    if (policyControl.logout === true && state.status !== 'review_complete') { state.status = 'logged_out'; state.sessionId = null; }
    return finish(policyControl.ok, policyControl.code, policyControl.status);
  }
  if (command.kind === 'resume') {
    if (state.status === 'review_complete') return finish(true, 'review_already_complete');
    const saved = saveNmlsReviewBookmark(state, continuity, serverTimeMs);
    invalidate('explicit_resume_current_unit_restart');
    state.status = 'active'; state.sessionId = newId(); state.lastActivityMs = serverTimeMs;
    const restored = restoreNmlsReviewBookmark(state, continuity, serverTimeMs);
    if (saved || restored) audit = { ...audit, reason: 'continuity_resume', invalidatedMs: 0,
      invalidatedUnitId: null, abandonedQuizId: null, ...(saved ? { bookmarkSaved: saved } : {}),
      ...(restored ? { bookmarkRestored: restored } : {}) };
    return finish(true, 'review_session_started');
  }
  if (policyCheck && ['active', 'review_complete'].includes(state.status)) return finish(true, 'review_policy_checked');
  if (state.status !== 'active') return finish(false, state.status === 'review_complete' ? 'review_already_complete' : 'course_logout_required', 401);
  if (command.kind === 'logout') {
    const saved = saveNmlsReviewBookmark(state, continuity, serverTimeMs);
    invalidate('voluntary_exit');
    if (saved) audit = { ...audit, reason: 'clean_voluntary_stop', invalidatedMs: 0,
      invalidatedUnitId: null, abandonedQuizId: null, bookmarkSaved: saved };
    return finish(true, 'course_logged_out');
  }
  if (state.bookmark) return finish(false, 'review_resume_required');
  const units = unitsOf(course);
  const currentUnit = units.find((u) => u.id === state.current?.unitId);
  if (command.kind === 'open_unit') {
    const next = units.find((u) => !state.completedUnitIds.includes(u.id));
    if (!next || command.unitId !== next.id || state.quiz) return finish(false, 'unit_sequence_blocked');
    const moduleIndex = course.modules.findIndex((m) => m.id === next.moduleId);
    if (course.modules.slice(0, moduleIndex).some((m) => !state.passedModuleIds.includes(m.id))) return finish(false, 'module_quiz_required');
    if (!state.current) {
      state.feedback = null;
      state.current = startNmlsUnitReview({ sessionId: state.sessionId, attemptId: newId(),
        unit: next, receivedAtMs: serverTimeMs });
      state.lastActivityMs = serverTimeMs;
    }
    // Reopening does not award time or refresh the activity clock.
    return finish(true, 'unit_open');
  }

  if (state.quiz && ['interaction', 'heartbeat'].includes(command.kind)) {
    // The six-minute rule is INACTIVITY, not a six-minute quiz time limit.
    // Visible learner gestures extend the course lease; polling and background
    // tabs do not. Assessment activity never awards instructional minutes.
    if (command.kind === 'interaction' && command.visible === true) state.lastActivityMs = serverTimeMs;
    return finish(true, 'quiz_activity_observed');
  }
  if (['heartbeat', 'interaction', 'unit_action', 'complete_unit'].includes(command.kind)) {
    if (!currentUnit || state.current.status !== 'active') return finish(false, 'active_unit_required');
    const event = { id: command.eventId, sessionId: state.sessionId, attemptId: state.current.attemptId,
      expectedRevision: state.current.revision, kind: command.kind === 'interaction' ? 'activity' : command.kind };
    const evidence = { receivedAtMs: serverTimeMs, visible: command.visible === true,
      // Validated observation format/lease, NOT proof of human identity. A
      // scripted browser could simulate gestures; BioSig/release gates remain.
      engagementValidated: command.visible === true };
    if (command.kind === 'unit_action') {
      const q = currentUnit.actionQuestion;
      if (!q.options.some((o) => o.id === command.choice)) return finish(false, 'invalid_answer', 400);
      const correct = q.correctChoice === command.choice;
      state.feedback = { questionId: q.id, correct, rationale: q.rationale, sourceUrls: q.sourceUrls };
      const alreadyVerified = correct && state.current.completedActionIds.includes(q.id);
      if (!correct || alreadyVerified) {
        // A submitted answer is activity even when wrong. It earns no reading
        // time and cannot verify a failed action. The server grades first.
        const previousUnitActivity = state.current.lastActivityMs;
        const observed = applyNmlsUnitReviewEvent(state.current, { ...event, kind: 'observe_answer' },
          { ...evidence, answerObserved: true });
        state.current = observed.state;
        if (!observed.ok) return finish(false, observed.code);
        state.current.processedEventIds = []; state.current.audit = [];
        if (alreadyVerified) {
          // A repeated verified answer breaks the time bridge but must not
          // become a new human gesture that can defeat inactivity logout.
          state.current.lastActivityMs = previousUnitActivity;
          audit.repeatedVerifiedAnswer = true;
        } else state.lastActivityMs = serverTimeMs;
        return finish(alreadyVerified, alreadyVerified ? 'action_already_verified' : 'review_answer_incorrect');
      }
      event.kind = 'verify_action'; event.actionId = q.id; evidence.verifiedActionId = q.id;
    }
    if (command.kind === 'complete_unit') event.kind = 'complete';
    const applied = applyNmlsUnitReviewEvent(state.current, event, evidence);
    state.current = applied.state;
    if (applied.code === 'course_logout_required') { invalidate('unit_idle_logout'); return finish(false, 'course_logout_required', 401); }
    if (!applied.ok) return finish(false, applied.code);
    if ((command.kind === 'interaction' && evidence.visible) || command.kind === 'unit_action') state.lastActivityMs = serverTimeMs;
    if (command.kind === 'complete_unit') {
      state.completedUnitIds.push(currentUnit.id); state.completedReviewMs += state.current.completedMs;
      audit = { ...audit, unitId: currentUnit.id, acceptedReviewMs: state.current.completedMs };
      state.current = null; state.lastActivityMs = serverTimeMs;
    }
    // Durable event table is the unbounded audit; bound the in-state ledger.
    if (state.current) { state.current.processedEventIds = []; state.current.audit = []; }
    return finish(true, command.kind === 'complete_unit' ? 'unit_review_complete' : 'review_event_accepted');
  }

  if (command.kind === 'quiz_start') {
    const module = course.modules.find((m) => !state.passedModuleIds.includes(m.id));
    if (!module || module.id !== command.moduleId || state.current || !module.units.every((u) => state.completedUnitIds.includes(u.id))) return finish(false, 'module_units_required');
    if (!state.quiz) {
      state.feedback = null;
      state.quiz = state.quizReservation ? structuredClone(state.quizReservation.quiz) :
        { id: newId(), moduleId: module.id, questionIds: selectQuestions(module.quiz.bank, module.quiz.questionsPerAttempt) };
      reserveNmlsReviewQuiz(state, continuity);
      state.lastActivityMs = serverTimeMs;
    }
    return finish(true, 'module_quiz_open');
  }
  if (command.kind === 'quiz_submit') {
    if (!state.quiz || command.quizId !== state.quiz.id) return finish(false, 'quiz_attempt_required');
    const answers = command.answers;
    if (!answers || Array.isArray(answers) || typeof answers !== 'object' ||
      Object.keys(answers).length !== state.quiz.questionIds.length ||
      !state.quiz.questionIds.every((id) => Object.hasOwn(answers, id) && questionById(course, id).options.some((o) => o.id === answers[id]))) return finish(false, 'invalid_answer_set', 400);
    const module = course.modules.find((m) => m.id === state.quiz.moduleId);
    const marked = state.quiz.questionIds.map((id) => {
      const q = questionById(course, id);
      return { questionId: id, correct: q.correctChoice === answers[id], rationale: q.rationale, sourceUrls: q.sourceUrls };
    });
    const correct = marked.filter((q) => q.correct).length;
    const passed = correct * 100 >= module.quiz.passPercent * marked.length;
    audit = { ...audit, quizId: state.quiz.id, moduleId: module.id, correct, total: marked.length, passed };
    state.feedback = { kind: 'module_quiz', correct, total: marked.length, passed, items: marked };
    if (passed) state.passedModuleIds.push(module.id);
    state.quiz = null; delete state.quizReservation; state.lastActivityMs = serverTimeMs;
    if (course.modules.every((m) => state.passedModuleIds.includes(m.id))) state.status = 'review_complete';
    return finish(true, passed ? 'module_review_passed' : 'module_review_retry');
  }
  return finish(false, 'unknown_review_command', 400);
}
