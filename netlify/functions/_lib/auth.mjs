import { requireStaff } from "./staff-session.mjs";

// Shared bearer strings no longer authorize privileged endpoints.
export async function requireAdmin(event) {
  return requireStaff(event, ["owner", "administrator"]);
}
