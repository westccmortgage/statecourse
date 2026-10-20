import {withLambda} from '@netlify/aws-lambda-compat';
import { parseJson } from "./_lib/http.mjs";
import { requireStudentSession, sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import { recordPlaybackEvent, requireStreamSameOrigin } from "./_lib/stream-delivery.mjs";

const MAX_EVENT_BODY_BYTES = 16_384;

const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
    requireStreamSameOrigin(event);
    if (Buffer.byteLength(event.body || "", "utf8") > MAX_EVENT_BODY_BYTES) {
      throw Object.assign(new Error("video_event_too_large"), { statusCode: 413 });
    }
    const auth = await requireStudentSession(event);
    const result = await recordPlaybackEvent({ auth, input: parseJson(event) });
    return sessionResponse(202, result, auth.refreshedSession ? sessionCookies(auth.refreshedSession) : []);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Stream event endpoint error", error?.message);
    return sessionResponse(status, { error: status >= 500 ? "stream_service_unavailable" : error.message });
  }
};

// Keep the existing Lambda handler contract on the modern Netlify runtime.
export {handler as legacyHandler};
export default withLambda(handler);
