import { requirePrivilege, ADMIN_ROLES, limit, audit } from "./staff-security.mjs";
import { dbRequest } from "./db.mjs";
import { requireStudentSession } from "./student-session.mjs";

/* Named staff authority is resolved from the existing append-only ledger.
 * Student authentication identifies a subject, but confers no administrator access.
 * Each admin request additionally requires a current exact-session MFA staff proof.
 * Browser metadata, email naming, and shared bearer strings grant no authority.
 */

const ROLES = Object.freeze([
  "owner",
  "administrator",
  "video_producer",
  "instructor",
  "regulator_reviewer",
  "support",
]);

const STATE = /^[A-Z]{2}$/;

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

function withinWindow(binding, now) {
  const effective = binding.effective_at ? new Date(binding.effective_at).valueOf() : null;
  const expires = binding.expires_at ? new Date(binding.expires_at).valueOf() : null;
  if (effective != null && Number.isNaN(effective)) return false;
  if (expires != null && Number.isNaN(expires)) return false;
  return (effective == null || effective <= now) && (expires == null || expires > now);
}

export function isStaffRole(value) {
  return ROLES.includes(String(value || ""));
}

export const STAFF_ROLES = ROLES;

/** Every currently effective binding for one authenticated user. */
export async function staffBindings(authUserId) {
  const rows = await dbRequest(
    `current_staff_actor_bindings?auth_user_id=eq.${encodeURIComponent(authUserId)}`
      + "&select=auth_user_id,actor_role,scope_state,binding_status,effective_at,expires_at,recorded_at",
  );
  const now = Date.now();
  return (rows || []).filter((binding) => binding.binding_status === "active" && withinWindow(binding, now));
}

/*
 * Authenticate, then authorize.
 *
 * `state` narrows the request to one jurisdiction. A binding with a null scope_state covers
 * every state; one carrying a code covers only that code, so a reviewer engaged for Texas
 * cannot read Michigan by changing a query parameter.
 */
export async function requireStaff(event, allowedRoles, { state = null } = {}) {
  const roles = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).filter(role => ADMIN_ROLES.includes(role));
  if (!roles.length) fail("staff_role_requirement_missing", 500);
  if (state != null && !STATE.test(state)) fail("invalid_state", 400);

  await limit(event, "request");
  const auth = await requireStudentSession(event);
  const bindings = await staffBindings(auth.student.id);
  if (!bindings.length) { await audit("admin_authority", "denied", auth); fail("staff_binding_required", 403); }

  const matching = bindings.filter((binding) => roles.includes(binding.actor_role)
    && (state == null || binding.scope_state == null || binding.scope_state === state));
  if (!matching.length) { await audit("admin_authority", "denied", auth); fail("staff_role_not_authorized", 403); }

  await requirePrivilege(event, auth);

  return {
    auth,
    bindings,
    /* Every role the person holds, for rendering the console. Authorization decisions use
       `matching`, which is already filtered to what this request needed. */
    roles: [...new Set(bindings.map((binding) => binding.actor_role))],
    matching,
    actorRole: matching[0].actor_role,
    /* Null when any matching binding is unscoped, otherwise the states they may act in. */
    scopeStates: matching.some((binding) => binding.scope_state == null)
      ? null
      : [...new Set(matching.map((binding) => binding.scope_state))],
  };
}

/*
 * Append-only record of what the console did.
 *
 * Never awaited into the caller's failure path: a console action that succeeded must not be
 * reported as failed because its audit row could not be written. The write failing is worth
 * a server log, and the action itself already left its own record.
 */
export async function logConsoleAction(staff, action, subject, detail = {}) {
  try {
    await dbRequest("admin_console_actions", {
      method: "POST",
      prefer: "return=minimal",
      body: {
        auth_user_id: staff.auth.student.id,
        actor_role: staff.actorRole,
        action: String(action).slice(0, 100),
        subject: subject == null ? null : String(subject).slice(0, 200),
        detail,
      },
    });
  } catch (error) {
    console.error("Admin console completion audit unavailable", String(action).slice(0,100));
  }
}

