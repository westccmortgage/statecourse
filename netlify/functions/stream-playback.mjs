import { requireStudentSession, sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import { issuePlayback, requireStreamSameOrigin } from "./_lib/stream-delivery.mjs";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
    requireStreamSameOrigin(event, { allowGet: true });
    const auth = await requireStudentSession(event);
    const payload = await issuePlayback({
      auth,
      assetKey: String(event.queryStringParameters?.asset || ""),
      enrollmentId: String(event.queryStringParameters?.enrollment_id || ""),
    });
    return sessionResponse(200, payload, auth.refreshedSession ? sessionCookies(auth.refreshedSession) : []);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Stream playback endpoint error", error?.message);
    return sessionResponse(status, { error: status >= 500 ? "stream_service_unavailable" : error.message });
  }
};
