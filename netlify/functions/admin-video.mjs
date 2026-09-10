import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { requireStaff } from "./_lib/staff-session.mjs";
import { sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import {
  confirmUpload, placeAsset, placeableCourseIds, placementTargets, reconcileUploads,
  recordGate, reserveUpload, uploadTextAssets, videoInventory, withdrawAsset,
} from "./_lib/video-console.mjs";

/*
 * The video chain: reserve an upload, confirm what Cloudflare received, record the ten
 * reviews, place, withdraw.
 *
 * Who may do what:
 *   video_producer  reserve, confirm, record reviews
 *   administrator   the above, plus place and withdraw
 *   owner           everything
 *
 * Placement is separated from review on purpose. The person who made the video should be
 * able to drive it all the way to release-ready without also being the person who decides
 * it goes in front of students, and on a one-person team the owner holds both roles and
 * still leaves two distinct records.
 */

const REVIEWERS = ["owner", "administrator", "video_producer"];
const PLACERS = ["owner", "administrator"];

function detailOf(error) {
  return error?.detail ? { detail: error.detail } : {};
}

/*
 * A missing environment variable is not a leak, it is a to-do.
 *
 * These arrive as 503s, and a 503 is otherwise answered with a generic message so a server
 * fault cannot describe itself to a stranger. That reduced "CLOUDFLARE_STREAM_API_TOKEN is
 * not set" to "admin video unavailable", leaving the one person who could fix it reading
 * function logs to find out. These messages name a configuration key and never a value, so
 * an authenticated staff member gets told which one is missing.
 */
const CONFIGURATION_ERROR = /^[a-z0-9_]+_(not_configured|invalid)$/;

function errorFor(error, status, authenticated) {
  if (status < 500) return error.message;
  if (authenticated && CONFIGURATION_ERROR.test(String(error?.message || ""))) return error.message;
  return "admin_video_unavailable";
}

export const handler = async (event) => {
  let cookies = [];
  let authenticated = false;
  try {
    if (event.httpMethod === "GET") {
      const staff = await requireStaff(event, [...REVIEWERS, "regulator_reviewer"]);
      authenticated = true;
      cookies = staff.auth.refreshedSession ? sessionCookies(staff.auth.refreshedSession) : [];
      const query = event.queryStringParameters || {};
      const courseId = String(query.course_id || "").trim() || null;

      /*
       * The requested course is checked against the caller's scope before anything about it
       * is returned. Without this, placementTargets took the query parameter straight from
       * the URL, so a reviewer scoped to one state could read another state's block and
       * screen structure by editing course_id — the inventory was scoped and the screen
       * map was not.
       */
      const allowedCourses = await placeableCourseIds(staff.scopeStates);
      if (courseId && staff.scopeStates && !allowedCourses.includes(courseId)) {
        const scoped = await videoInventory({ courseId: null, scopeStates: staff.scopeStates });
        if (!scoped.assets.some((asset) => asset.course_id === courseId)) {
          throw Object.assign(new Error("course_outside_staff_scope"), { statusCode: 403 });
        }
      }

      const inventory = await videoInventory({ courseId, scopeStates: staff.scopeStates });
      return sessionResponse(200, {
        viewer: { roles: staff.roles, canPlace: staff.roles.some((role) => PLACERS.includes(role)) },
        courseId,
        /* The courses whose block maps are indexed, and — once one is chosen — every
           instruction screen it actually has. The console offers these instead of a
           free-text field, so a placement cannot name a screen that does not exist. */
        placeableCourses: allowedCourses,
        placementTargets: courseId ? placementTargets(courseId) : [],
        ...inventory,
      }, cookies);
    }

    if (event.httpMethod !== "POST") throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
    requireSameOrigin(event);
    const input = parseJson(event);
    const action = String(input.action || "");

    /* Authorized per action, before anything is read or written. */
    const allowed = ["place", "withdraw"].includes(action) ? PLACERS : REVIEWERS;
    const staff = await requireStaff(event, allowed);
    authenticated = true;
    cookies = staff.auth.refreshedSession ? sessionCookies(staff.auth.refreshedSession) : [];

    let result;
    if (action === "reserve_upload") result = await reserveUpload({ staff, input });
    else if (action === "confirm_upload") result = await confirmUpload({ staff, input });
    else if (action === "upload_text_assets") result = await uploadTextAssets({ staff, input });
    else if (action === "record_gate") result = await recordGate({ staff, input });
    else if (action === "reconcile_uploads") result = await reconcileUploads({ staff });
    else if (action === "place") result = await placeAsset({ staff, input });
    else if (action === "withdraw") result = await withdrawAsset({ staff, input });
    else throw Object.assign(new Error("unknown_video_action"), { statusCode: 400 });

    return sessionResponse(200, {
      action,
      /* Repeated on every write so no response can be read as a release decision that was
         not made by the gate. */
      grantsApproval: false,
      ...result,
    }, cookies);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Admin video endpoint error", error?.message);
    return sessionResponse(status, {
      error: errorFor(error, status, authenticated),
      ...(status >= 500 ? {} : detailOf(error)),
    }, cookies);
  }
};
