import {withLambda} from '@netlify/aws-lambda-compat';
import { dbRequest, rpc } from "./_lib/db.mjs";
import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import {
  californiaFinalExamForm,
  getCaliforniaCourse,
  getCaliforniaFinalExam,
  publicAssessment,
  scoreCaliforniaFinalExam
} from "../../config/california-course-engine.mjs";

/* Delivery of the California final examination.
 *
 * The single rule this file exists to keep: RE 303 forbids furnishing the final
 * examination to the student. The answer key, the rationales, and the answer-key source
 * references live in config/california/*-final-exam-bank.mjs and are read only here, on
 * the server. Every response body is built through publicAssessment(), which strips
 * each item down to id, prompt, and choices, and no path in this file returns a score
 * breakdown, a per-item verdict, or a correct answer - not on save, not on submit, not
 * after a pass. The student learns the percentage and whether they passed.
 *
 * A reviewer never sits an examination here. Reviewer mode exists so the Department can
 * read the course; an attempt is a student record, and letting a reviewer create one
 * would put regulator activity into student completion history.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/* PROVIDER-SET, not regulator-fixed: RE 303 requires the identification to be presented
   "immediately before the administration" and gives no number. Recorded on the session
   so an audit shows what governed a given attempt. */
const IDENTITY_WINDOW_MINUTES = 60;

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

/* The engine's remaining_requirements are compact regulatory labels. A student reading
   "California 2.5-week minimum period" learns nothing about what to do. Each label is
   translated into a sentence that says what the rule is, and where a date exists, when
   the student becomes eligible. Nothing here invents a requirement: every entry is
   keyed to a label the eligibility function already produced. */
export function explainRequirement(label, eligibility) {
  const earliest = eligibility?.earliest_final_exam_at
    ? new Date(eligibility.earliest_final_exam_at)
    : null;
  const on = earliest
    ? earliest.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  if (/lesson assignments/.test(label)) {
    return `California requires all fifteen lesson assignments before the final examination. ${label} remain.`;
  }
  if (/2\.5-week minimum period/.test(label)) {
    return on
      ? `California sets a minimum study period of two and a half weeks from the day your course access began. You become eligible on ${on}.`
      : "California sets a minimum study period of two and a half weeks from the day your course access began.";
  }
  if (/Course access not yet granted/.test(label)) {
    return "Your course access has not been granted yet, so the minimum study period has not started.";
  }
  if (/five-week completion window/.test(label)) {
    return "California allows no more than two courses to be completed in any five-week period. One of your recent completions falls inside that window.";
  }
  if (/Identity and proctor authorization/.test(label)) {
    return "California requires a proctor to verify your photo identification immediately before the final examination. Your school will record that verification when your examination is scheduled.";
  }
  if (/Enrollment expired/.test(label)) {
    return "California requires the course to be completed within one year of registration. This enrollment has passed that date and must be taken again.";
  }
  return label;
}

async function contextFor(studentId, enrollmentId) {
  if (!UUID.test(enrollmentId || "")) fail("invalid_enrollment", 400);
  const rows = await dbRequest(`enrollments?id=eq.${encodeURIComponent(enrollmentId)}&select=*&limit=1`);
  const enrollment = rows?.[0];
  if (!enrollment || enrollment.state !== "CA") fail("california_enrollment_not_found", 404);
  if (enrollment.student_id !== studentId) {
    /* A reviewer reaching this endpoint is refused rather than served a read-only view:
       there is nothing here for a reviewer to read that the register does not already
       show, and an attempt started under a reviewer's account would be a student
       record created by the regulator. */
    fail("final_exam_is_student_only", 403);
  }
  const course = getCaliforniaCourse(enrollment.course_id);
  if (!course) fail("california_course_configuration_missing", 503);
  return { enrollment, course, studentId };
}

async function attemptHistory(enrollmentId) {
  const rows = await dbRequest(
    `final_exam_sessions?enrollment_id=eq.${encodeURIComponent(enrollmentId)}&select=id,attempt_number,exam_form,status,started_at,expires_at,submitted_at,score_percent,passed,question_count,passing_percent,time_limit_minutes&order=attempt_number.asc`
  );
  return rows || [];
}

function openSession(sessions) {
  return sessions.find((session) => session.status === "in_progress" && new Date(session.expires_at) > new Date()) || null;
}

/* The items the student sees, in the same order the scorer will read them. The order is
   the bank order and the choice order is the deterministic permutation keyed to the item
   id, so a stored selected_choice keeps its meaning for as long as the record exists. */
function deliverableExam(courseId, form) {
  const exam = getCaliforniaFinalExam(courseId, form);
  if (!exam) fail("final_exam_unavailable", 503);
  return exam;
}

async function statusPayload(ctx, extra = {}) {
  const eligibilityRows = await dbRequest(
    `course_final_eligibility?enrollment_id=eq.${encodeURIComponent(ctx.enrollment.id)}&select=*&limit=1`
  );
  const eligibility = eligibilityRows?.[0] || null;
  const sessions = await attemptHistory(ctx.enrollment.id);
  const open = openSession(sessions);
  const closed = sessions.filter((session) => session.status === "submitted" || session.status === "expired");
  const passed = closed.some((session) => session.passed);
  const attemptsUsed = closed.length;
  const remaining = Array.isArray(eligibility?.remaining_requirements) ? eligibility.remaining_requirements : [];
  return {
    enrollmentId: ctx.enrollment.id,
    course: {
      courseId: ctx.course.courseId,
      title: ctx.course.title,
      version: ctx.course.version,
      approvalStatus: ctx.course.approvalStatus
    },
    exam: {
      questionCount: ctx.course.finalQuestionCount,
      passingPercent: ctx.course.finalPassingPercent,
      /* PROVIDER-SET, subject to the Department's review of RE 306 items 19-20. */
      timeLimitMinutes: ctx.course.finalExamMinutes,
      maximumAttempts: 2,
      attemptsUsed,
      attemptsRemaining: passed ? 0 : Math.max(0, 2 - attemptsUsed),
      nextForm: passed ? null : californiaFinalExamForm(attemptsUsed + 1)
    },
    eligibility: {
      eligible: Boolean(eligibility?.final_exam_eligible),
      earliestAt: eligibility?.earliest_final_exam_at || null,
      /* Both forms are returned: the labels are what the regulator's own function
         produced, the explanations are what the student is shown. */
      remainingLabels: remaining,
      remaining: remaining.map((label) => explainRequirement(label, eligibility))
    },
    attempts: closed.map((session) => ({
      attemptNumber: session.attempt_number,
      form: session.exam_form,
      status: session.status,
      submittedAt: session.submitted_at,
      scorePercent: session.score_percent,
      passed: session.passed
    })),
    passed,
    openSession: open
      ? {
          sessionId: open.id,
          attemptNumber: open.attempt_number,
          form: open.exam_form,
          startedAt: open.started_at,
          expiresAt: open.expires_at,
          secondsRemaining: Math.max(0, Math.floor((new Date(open.expires_at) - new Date()) / 1000))
        }
      : null,
    ...extra
  };
}

async function startAttempt(ctx) {
  const sessions = await attemptHistory(ctx.enrollment.id);
  const existing = openSession(sessions);
  const attemptNumber = existing
    ? existing.attempt_number
    : sessions.filter((session) => session.status === "submitted" || session.status === "expired").length + 1;
  const form = californiaFinalExamForm(attemptNumber);
  if (!form) fail("final_exam_attempts_exhausted", 409);
  const exam = deliverableExam(ctx.course.courseId, form);

  const started = await rpc("start_california_final_exam", {
    p_enrollment_id: ctx.enrollment.id,
    p_actor_id: ctx.studentId,
    p_exam_form: form,
    p_question_count: exam.items.length,
    p_passing_percent: exam.passingPercent,
    p_time_limit_minutes: exam.minutes,
    p_identity_window_minutes: IDENTITY_WINDOW_MINUTES,
    p_delivery_metadata: { delivery: "browser", non_printable: true, non_downloadable: true }
  });
  if (!started?.session_id) fail("final_exam_start_failed", 503);

  const delivered = deliverableExam(ctx.course.courseId, started.exam_form);
  const answered = await savedAnswers(started.session_id, delivered);
  return statusPayload(ctx, {
    session: {
      sessionId: started.session_id,
      attemptNumber: started.attempt_number,
      form: started.exam_form,
      startedAt: started.started_at,
      expiresAt: started.expires_at,
      resumed: Boolean(started.resumed),
      secondsRemaining: Math.max(0, Math.floor((new Date(started.expires_at) - new Date()) / 1000)),
      /* publicAssessment strips the key. Nothing else in this response carries items. */
      examination: publicAssessment(delivered),
      answers: answered
    }
  });
}

/* Answers already saved for a resumed attempt, positional and keyed by item id so a
   reordered payload cannot shift a student's answers onto different questions. Only the
   student's own selections are returned; the `correct` column is never read. */
async function savedAnswers(sessionId, exam) {
  const rows = await dbRequest(
    `final_exam_responses?session_id=eq.${encodeURIComponent(sessionId)}&select=item_id,selected_choice`
  );
  const byItem = new Map((rows || []).map((row) => [row.item_id, row.selected_choice]));
  return exam.items.map((item) => (byItem.has(item.id) ? byItem.get(item.id) : null));
}

async function sessionFor(ctx, sessionId) {
  if (!UUID.test(sessionId || "")) fail("invalid_session", 400);
  const rows = await dbRequest(
    `final_exam_sessions?id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`
  );
  const session = rows?.[0];
  if (!session) fail("final_exam_session_not_found", 404);
  if (session.enrollment_id !== ctx.enrollment.id || session.student_id !== ctx.studentId) {
    fail("course_access_denied", 403);
  }
  return session;
}

async function scoreFor(ctx, session, answers) {
  const exam = deliverableExam(ctx.course.courseId, session.exam_form);
  const score = scoreCaliforniaFinalExam(exam, answers);
  if (!score) fail("invalid_answers", 400);
  return score;
}

async function saveProgress(ctx, input) {
  const session = await sessionFor(ctx, String(input.sessionId || ""));
  const score = await scoreFor(ctx, session, input.answers);
  const saved = await rpc("save_california_final_exam_progress", {
    p_session_id: session.id,
    p_actor_id: ctx.studentId,
    p_results: score.results
  });
  /* answeredCount is the student's own count of answered questions. correctCount is
     deliberately absent: a running score would tell the student which answers were
     right while the examination is still open. */
  return {
    ok: true,
    sessionId: session.id,
    savedCount: Number(saved || 0),
    answeredCount: score.answeredCount,
    questionCount: score.total,
    secondsRemaining: Math.max(0, Math.floor((new Date(session.expires_at) - new Date()) / 1000))
  };
}

async function submitAttempt(ctx, input) {
  const session = await sessionFor(ctx, String(input.sessionId || ""));
  const score = await scoreFor(ctx, session, input.answers);
  const result = await rpc("submit_california_final_exam", {
    p_session_id: session.id,
    p_actor_id: ctx.studentId,
    p_results: score.results
  });
  if (!result) fail("final_exam_submit_failed", 503);
  return statusPayload(ctx, {
    result: {
      sessionId: session.id,
      attemptNumber: result.attempt_number,
      form: result.exam_form,
      scorePercent: result.score_percent,
      passingPercent: result.passing_percent,
      answeredCount: result.answered_count,
      questionCount: result.question_count,
      passed: result.passed,
      lateSubmission: result.late_submission,
      retakeAvailable: result.retake_available,
      /* No per-item results. RE 303 keeps the examination out of the student's hands,
         and a list of which questions were missed is the examination. */
      message: result.passed
        ? "You passed the final examination. Your completion record has been created."
        : result.retake_available
          ? "You did not reach the passing score. California allows one retake, which uses a different examination form."
          : "You did not reach the passing score and no further attempt is available under California's rules."
    }
  });
}

const handler = async (event) => {
  try {
    const auth = await requireStudentSession(event);
    const cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];
    const input = event.httpMethod === "POST" ? parseJson(event) : {};
    const enrollmentId = event.httpMethod === "GET"
      ? String(event.queryStringParameters?.enrollment_id || "")
      : String(input.enrollmentId || "");
    const ctx = await contextFor(auth.student.id, enrollmentId);

    if (event.httpMethod === "GET") {
      return sessionResponse(200, await statusPayload(ctx), cookies);
    }
    if (event.httpMethod === "POST") {
      requireSameOrigin(event);
      const action = String(input.action || "");
      if (action === "start") return sessionResponse(200, await startAttempt(ctx), cookies);
      if (action === "save") return sessionResponse(200, await saveProgress(ctx, input), cookies);
      if (action === "submit") return sessionResponse(200, await submitAttempt(ctx, input), cookies);
      fail("invalid_final_exam_action", 400);
    }
    fail("method_not_allowed", 405);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Final examination endpoint error", error?.message);
    return sessionResponse(status, { error: status >= 500 ? "final_exam_unavailable" : error.message });
  }
};

// Keep the existing Lambda handler contract on the modern Netlify runtime.
export {handler as legacyHandler};
export default withLambda(handler);
