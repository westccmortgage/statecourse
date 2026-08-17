import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { clearSessionCookies, requireStudentSession, sessionCookies, sessionResponse, signInStudent, signOutStudent } from "./_lib/student-session.mjs";

export const handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      const auth = await requireStudentSession(event);
      return sessionResponse(200,{ student:auth.student },auth.refreshedSession ? sessionCookies(auth.refreshedSession) : []);
    }
    if (event.httpMethod === "POST") {
      requireSameOrigin(event);
      const input = parseJson(event);
      const result = await signInStudent(input.email,input.password);
      return sessionResponse(200,{ student:result.student },sessionCookies(result.session));
    }
    if (event.httpMethod === "DELETE") {
      requireSameOrigin(event);
      await signOutStudent(event);
      return sessionResponse(200,{ ok:true },clearSessionCookies());
    }
    throw Object.assign(new Error("method_not_allowed"),{ statusCode:405 });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Student session endpoint error",error?.message);
    return sessionResponse(status,{ error:status >= 500 ? "student_auth_unavailable" : error.message },status === 401 ? clearSessionCookies() : []);
  }
};
