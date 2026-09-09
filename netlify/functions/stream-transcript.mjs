import { requireStudentSession, sessionCookies } from "./_lib/student-session.mjs";
import { readProtectedTranscript, requireStreamSameOrigin } from "./_lib/stream-delivery.mjs";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
    requireStreamSameOrigin(event, { allowGet: true });
    const auth = await requireStudentSession(event);
    const text = await readProtectedTranscript({
      auth,
      assetKey: String(event.queryStringParameters?.asset || ""),
      enrollmentId: String(event.queryStringParameters?.enrollment_id || ""),
    });
    const response = {
      statusCode: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store, private",
        "x-content-type-options": "nosniff",
      },
      body: text,
    };
    if (auth.refreshedSession) response.multiValueHeaders = { "set-cookie": sessionCookies(auth.refreshedSession) };
    return response;
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Stream transcript endpoint error", error?.message);
    return {
      statusCode: status,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store, private" },
      body: status >= 500 ? "Transcript temporarily unavailable." : "Transcript unavailable.",
    };
  }
};
