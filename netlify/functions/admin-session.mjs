import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import {
  clearSessionCookies, requireStudentSession, sessionCookies, sessionResponse,
  signInStudent, signOutStudent,
} from "./_lib/student-session.mjs";
import { staffBindings } from "./_lib/staff-session.mjs";

/*
 * Owner and staff sign-in for the administration console.
 *
 * Authentication is the same Supabase session students use — one identity provider, one
 * refresh path, one set of __Host- cookies — and authorization is separate: holding a
 * session proves who you are and grants nothing until a binding says what you may do. A
 * person with no binding signs in successfully and sees an empty console, which is the
 * correct outcome and a much clearer one than a failed password.
 *
 * A successful sign-in with no binding is answered with 200 and an empty role list rather
 * than 403: the credential was right, and telling the caller otherwise sends them to reset
 * a password that works.
 */

async function describe(auth) {
  const bindings = await staffBindings(auth.student.id);
  return {
    user: {
      id: auth.student.id,
      email: auth.student.email,
      firstName: auth.student.firstName,
      lastName: auth.student.lastName,
    },
    roles: [...new Set(bindings.map((binding) => binding.actor_role))].sort(),
    bindings: bindings.map((binding) => ({
      actorRole: binding.actor_role,
      scopeState: binding.scope_state,
      effectiveAt: binding.effective_at,
      expiresAt: binding.expires_at,
    })),
    /* Said in the payload so a console cannot imply otherwise: signing in grants no
       regulator approval and opens no enrollment. */
    grantsApproval: false,
  };
}

export const handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      const auth = await requireStudentSession(event);
      return sessionResponse(200, await describe(auth), auth.refreshedSession ? sessionCookies(auth.refreshedSession) : []);
    }
    if (event.httpMethod === "POST") {
      requireSameOrigin(event);
      const input = parseJson(event);
      const result = await signInStudent(input.email, input.password);
      const bindings = await staffBindings(result.student.id);
      return sessionResponse(200, {
        user: {
          id: result.student.id,
          email: result.student.email,
          firstName: result.student.firstName,
          lastName: result.student.lastName,
        },
        roles: [...new Set(bindings.map((binding) => binding.actor_role))].sort(),
        bindings: bindings.map((binding) => ({
          actorRole: binding.actor_role,
          scopeState: binding.scope_state,
          effectiveAt: binding.effective_at,
          expiresAt: binding.expires_at,
        })),
        grantsApproval: false,
      }, sessionCookies(result.session));
    }
    if (event.httpMethod === "DELETE") {
      requireSameOrigin(event);
      await signOutStudent(event);
      return sessionResponse(200, { ok: true }, clearSessionCookies());
    }
    throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Admin session endpoint error", error?.message);
    return sessionResponse(
      status,
      { error: status >= 500 ? "admin_session_unavailable" : error.message },
      status === 401 ? clearSessionCookies() : [],
    );
  }
};
