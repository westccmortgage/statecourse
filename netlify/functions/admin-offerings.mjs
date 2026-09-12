import { parseJson, requireSameOrigin } from "./_lib/http.mjs";
import { requireStaff } from "./_lib/staff-session.mjs";
import { sessionCookies, sessionResponse } from "./_lib/student-session.mjs";
import {
  GOVERNANCE_VOCABULARY, governanceCatalogue, recordGovernance, representationCopy,
} from "./_lib/offering-governance.mjs";

/*
 * Approval, training access and payment mode, per offering.
 *
 * Reading is open to any staff role that can see the catalog. Writing is administrator
 * work, except for one value: setting payment mode to live, which only the owner can do
 * and which the database independently refuses without a named, dated approval.
 */
const READERS = ["owner", "administrator", "regulator_reviewer", "support"];
const WRITERS = ["owner", "administrator"];

export const handler = async (event) => {
  let cookies = [];
  try {
    if (event.httpMethod === "GET") {
      const staff = await requireStaff(event, READERS);
      cookies = staff.auth.refreshedSession ? sessionCookies(staff.auth.refreshedSession) : [];
      const rows = await governanceCatalogue();
      const visible = staff.scopeStates
        ? rows.filter((row) => staff.scopeStates.includes(row.state))
        : rows;
      return sessionResponse(200, {
        viewer: {
          roles: staff.roles,
          scopeStates: staff.scopeStates,
          /* Rendered by the console so the control is absent rather than present and
             refused. The server refuses regardless. */
          canActivateLivePayments: staff.matching.some(b => b.actor_role === 'owner'),
          ownerScopeStates: staff.matching.some(b => b.actor_role === 'owner' && b.scope_state == null) ? null : staff.matching.filter(b => b.actor_role === 'owner').map(b => b.scope_state),
        },
        vocabulary: GOVERNANCE_VOCABULARY,
        offerings: visible.map((row) => ({ ...row, copy: representationCopy(row) })),
      }, cookies);
    }

    if (event.httpMethod !== "POST") throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
    requireSameOrigin(event);
    const staff = await requireStaff(event, WRITERS);
    cookies = staff.auth.refreshedSession ? sessionCookies(staff.auth.refreshedSession) : [];
    const result = await recordGovernance({ staff, input: parseJson(event) });
    return sessionResponse(200, {
      ...result,
      /* Said on every write because the two are routinely conflated, and conflating them
         is how an approval quietly starts taking money. */
      approvalDidNotActivateCharging: true,
    }, cookies);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Admin offerings endpoint error", error?.message);
    return sessionResponse(status, {
      error: status >= 500 ? "admin_offerings_unavailable" : error.message,
      ...(status < 500 && error?.detail ? { detail: error.detail } : {}),
    }, cookies);
  }
};
