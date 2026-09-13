import { dbRequest } from "./db.mjs";
import { parseJson, requireSameOrigin } from "./http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse, updateStudentProfile } from "./student-session.mjs";
import { availableTraining } from './training-access.mjs';
import { withNmlsTrainingSummary } from './nmls-training-portal.mjs';

const EVENT_TYPES = new Set(["portal_opened","course_resume_clicked","certificate_viewed","receipt_viewed","profile_viewed"]);

async function enrollmentBelongsTo(studentId,enrollmentId) {
  if (!enrollmentId) return true;
  const rows = await dbRequest(`enrollments?id=eq.${encodeURIComponent(enrollmentId)}&student_id=eq.${encodeURIComponent(studentId)}&select=id&limit=1`);
  return Boolean(rows?.[0]);
}

export const handleStudentPortal = async (event) => {
  try {
    const auth = await requireStudentSession(event);
    const cookies = auth.refreshedSession ? sessionCookies(auth.refreshedSession) : [];

    if (event.httpMethod === "GET") {
      const [profiles,enrollments,origins,training] = await Promise.all([
        dbRequest(`students?id=eq.${encodeURIComponent(auth.student.id)}&select=id,email,first_name,last_name,preferred_name,locale,timezone,account_status&limit=1`),
        dbRequest(`student_portal_enrollments?student_id=eq.${encodeURIComponent(auth.student.id)}&order=enrollment_date.desc`),
        dbRequest(`enrollments?student_id=eq.${encodeURIComponent(auth.student.id)}&select=id,enrollment_origin`),
        availableTraining(),
      ]);
      await dbRequest("student_portal_events",{ method:"POST",prefer:"return=minimal",body:{ student_id:auth.student.id,event_type:"portal_opened",metadata:{ source:"student_portal" } } });
      const summaries=await Promise.all((enrollments||[]).map(row=>withNmlsTrainingSummary(auth.student.id,{...row,enrollment_origin:origins?.find(item=>item.id===row.enrollment_id)?.enrollment_origin||null})));
      return sessionResponse(200,{ student:profiles?.[0] || auth.student,enrollments:summaries,training,serverTime:new Date().toISOString() },cookies);
    }

    if (event.httpMethod === "POST") {
      requireSameOrigin(event);
      const input = parseJson(event);
      const eventType = String(input.eventType || "");
      const enrollmentId = input.enrollmentId ? String(input.enrollmentId) : null;
      if (!EVENT_TYPES.has(eventType)) throw Object.assign(new Error("invalid_portal_event"),{ statusCode:400 });
      if (!(await enrollmentBelongsTo(auth.student.id,enrollmentId))) throw Object.assign(new Error("enrollment_not_found"),{ statusCode:404 });
      await dbRequest("student_portal_events",{ method:"POST",prefer:"return=minimal",body:{ student_id:auth.student.id,enrollment_id:enrollmentId,event_type:eventType,metadata:{ source:"student_portal" } } });
      if (eventType === "course_resume_clicked" && enrollmentId) {
        await dbRequest(`enrollments?id=eq.${encodeURIComponent(enrollmentId)}&student_id=eq.${encodeURIComponent(auth.student.id)}`,{ method:"PATCH",prefer:"return=minimal",body:{ last_portal_accessed_at:new Date().toISOString() } });
      }
      return sessionResponse(200,{ ok:true },cookies);
    }

    if (event.httpMethod === "PATCH") {
      requireSameOrigin(event);
      const input = parseJson(event);
      const student = await updateStudentProfile(auth.accessToken,input);
      await dbRequest("student_portal_events",{
        method:"POST",
        prefer:"return=minimal",
        body:{ student_id:auth.student.id,event_type:"profile_viewed",metadata:{ source:"student_portal",action:"name_updated" } }
      });
      return sessionResponse(200,{ ok:true,student },cookies);
    }

    throw Object.assign(new Error("method_not_allowed"),{ statusCode:405 });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Student portal unavailable");
    return sessionResponse(status,{ error:status >= 500 ? "student_portal_unavailable" : error.message });
  }
};
