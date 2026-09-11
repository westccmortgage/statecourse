import { dbRequest } from './_lib/db.mjs';
import { requireStudentSession, sessionCookies, clearSessionCookies } from './_lib/student-session.mjs';
import { getCaliforniaCourse, getCaliforniaFinalExam } from '../../config/california-course-engine.mjs';

// DRE RE 303 item 15: a regulator may inspect final examinations without sitting one.
// Authority comes from a current course_review_access grant, never from a URL flag,
// a profile label, or a non-credit student enrollment. No exam session is created.
function reply(status, body, cookies = []) {
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex, nofollow',
  });
  for (const cookie of cookies) headers.append('set-cookie', cookie);
  return new Response(JSON.stringify(body), { status, headers });
}

export default async function reviewExams(request) {
  if (request.method !== 'GET') return reply(405, { error: 'method_not_allowed' });
  let cookies = [];
  try {
    const auth = await requireStudentSession({ headers: Object.fromEntries(request.headers.entries()) });
    cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];
    const grants = await dbRequest(`course_review_access?user_id=eq.${encodeURIComponent(auth.student.id)}`
      + '&active=eq.true&select=course_id,access_role,active,expires_at');
    const now = Date.now();
    const courses = [...new Set((grants || []).filter(grant =>
      grant.active === true
      && ['regulator_reviewer', 'internal_reviewer', 'administrator'].includes(grant.access_role)
      && (grant.expires_at == null || Date.parse(grant.expires_at) > now)
    ).map(grant => grant.course_id))].map(id => getCaliforniaCourse(id)).filter(Boolean)
      .map(course => ({ courseId: course.courseId, title: course.title, version: course.version }))
      .sort((a, b) => a.title.localeCompare(b.title));
    if (!courses.length) return reply(403, { error: 'course_review_access_required' }, cookies);
    const params = new URL(request.url).searchParams;
    const courseId = params.get('course_id') || courses[0].courseId;
    const course = courses.find(item => item.courseId === courseId);
    if (!course) return reply(403, { error: 'course_review_access_required' }, cookies);
    const form = params.get('form') || 'A';
    if (!['A', 'B'].includes(form)) return reply(400, { error: 'invalid_exam_form' }, cookies);
    const exam = getCaliforniaFinalExam(courseId, form);
    if (!exam) return reply(503, { error: 'review_exam_unavailable' }, cookies);
    return reply(200, {
      mode: 'regulator_review',
      notice: 'Regulator review — no timer, no examination attempt, no study credit or completion record.',
      courses, course,
      exam: {
        form, questionCount: exam.items.length, passingPercent: exam.passingPercent, minutes: exam.minutes,
        items: exam.items.map(item => ({
          id: item.id, prompt: item.prompt, choices: [...item.choices],
          correctChoice: item.correctChoice, rationale: item.rationale, source: item.source,
        })),
      },
    }, cookies);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    return reply(status, { error: status >= 500 ? 'review_exams_unavailable' : error.message },
      status === 401 ? clearSessionCookies() : cookies);
  }
}

export const config = { path: '/api/student/review-exams' };
