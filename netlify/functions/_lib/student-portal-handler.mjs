import { dbRequest } from "./db.mjs";
import { parseJson, requireSameOrigin } from "./http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse, updateStudentProfile } from "./student-session.mjs";
import { availableTraining } from './training-access.mjs';
import { withNmlsTrainingSummary } from './nmls-training-portal.mjs';
import { saveStudentNmlsId } from './student-nmls-identity.mjs';
import { nmlsIdProfileState } from '../../../config/nmls/student-identifier.mjs';
import { splitPortalEnrollments } from './portal-sections.mjs';
import { asCreditReviewCourse } from './nmls-credit-review.mjs';

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
      /* Two views of the same record. The main dashboard carries credit courses only;
         free training has its own section and entry point, so a practice enrollment is
         never read as a purchase or as progress toward a licence. */
      const section = event.queryStringParameters?.section === "free-training" ? "free-training" : "main";
      const [profiles,enrollments,origins,training] = await Promise.all([
        dbRequest(`students?id=eq.${encodeURIComponent(auth.student.id)}&select=id,email,first_name,last_name,preferred_name,locale,timezone,account_status,nmls_id&limit=1`),
        dbRequest(`student_portal_enrollments?student_id=eq.${encodeURIComponent(auth.student.id)}&order=enrollment_date.desc`),
        dbRequest(`enrollments?student_id=eq.${encodeURIComponent(auth.student.id)}&select=id,enrollment_origin,review_role`),
        section === "free-training" ? availableTraining() : null,
      ]);
      await dbRequest("student_portal_events",{ method:"POST",prefer:"return=minimal",body:{ student_id:auth.student.id,event_type:"portal_opened",metadata:{ source:section === "free-training" ? "student_free_training" : "student_portal" } } });
      const record=id=>origins?.find(item=>item.id===id);
      const summaries=await Promise.all((enrollments||[]).map(row=>withNmlsTrainingSummary(auth.student.id,{...row,enrollment_origin:record(row.enrollment_id)?.enrollment_origin||null})));
      const split=splitPortalEnrollments(summaries.map(row=>({...row,review_role:record(row.enrollment_id)?.review_role||null})));
      const profile=profiles?.[0] || auth.student;
      /* Stated separately from the raw column so the portal can tell "never entered" from
         "entered", and never shows an empty box as though it held a saved number. */
      const nmlsIdentity=nmlsIdProfileState(profile?.nmls_id ?? null);
      if (section === "free-training") return sessionResponse(200,{ section,student:profile,enrollments:split.freeTraining,training,serverTime:new Date().toISOString() },cookies);
      return sessionResponse(200,{ section,student:profile,nmlsIdentity,enrollments:split.main.map(asCreditReviewCourse),
        freeTraining:{ enrollmentCount:split.freeTraining.length,href:"/student/free-training/" },serverTime:new Date().toISOString() },cookies);
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
      /* Name and NMLS number are corrected independently. A learner fixing a mistyped
         identifier must not have to resend their name, and vice versa, so neither field
         is required by the presence of the other. */
      const wantsName = input.firstName !== undefined || input.lastName !== undefined;
      const wantsNmlsId = input.nmlsId !== undefined;
      if (!wantsName && !wantsNmlsId) throw Object.assign(new Error("invalid_student_profile"),{ statusCode:400 });

      let student = null;
      if (wantsName) {
        student = await updateStudentProfile(auth.accessToken,input);
        await dbRequest("student_portal_events",{
          method:"POST",
          prefer:"return=minimal",
          body:{ student_id:auth.student.id,event_type:"profile_viewed",metadata:{ source:"student_portal",action:"name_updated" } }
        });
      }

      let nmlsIdentity = null;
      if (wantsNmlsId) {
        const saved = await saveStudentNmlsId(auth.student.id,input.nmlsId);
        nmlsIdentity = nmlsIdProfileState(saved.nmlsId);
        /* Logged only when the number actually moved. The authoritative history is
           student_nmls_id_changes; this event exists so the portal timeline matches it. */
        if (saved.changed) {
          await dbRequest("student_portal_events",{
            method:"POST",
            prefer:"return=minimal",
            /* The identifier itself is deliberately absent from the metadata: it already
               lives in the identity log, and portal events are a looser store. */
            body:{ student_id:auth.student.id,event_type:"profile_viewed",metadata:{ source:"student_portal",action:"nmls_id_updated" } }
          });
        }
      }

      return sessionResponse(200,{ ok:true,student,nmlsIdentity },cookies);
    }

    throw Object.assign(new Error("method_not_allowed"),{ statusCode:405 });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Student portal unavailable");
    return sessionResponse(status,{ error:status >= 500 ? "student_portal_unavailable" : error.message });
  }
};
