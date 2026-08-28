import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { registerStudent, sessionCookies, sessionResponse } from "./_lib/student-session.mjs";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") throw Object.assign(new Error("method_not_allowed"),{ statusCode:405 });
    requireSameOrigin(event);
    const result = await registerStudent(parseJson(event));
    return sessionResponse(
      201,
      { student:result.student, confirmationRequired:result.confirmationRequired },
      result.session ? sessionCookies(result.session) : []
    );
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) {
      /* Names only, never values: which Supabase-related variables this runtime can actually
         see. Diagnoses the "configured in the UI but absent at runtime" class of failure. */
      const visible = Object.keys(process.env).filter((key) => key.toUpperCase().includes("SUPA")).join(", ") || "(none)";
      console.error("Student registration endpoint error", error?.message, "| SUPA* env vars visible to runtime:", visible);
    }
    return sessionResponse(status,{ error:status >= 500 ? "student_registration_unavailable" : error.message });
  }
};

