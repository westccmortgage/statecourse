import { requireStaff, logConsoleAction } from "./_lib/staff-session.mjs";
import { buildCatalogTruth } from "./_lib/catalog-truth.mjs";
import { sessionCookies, sessionResponse } from "./_lib/student-session.mjs";

/*
 * The catalog as it actually is.
 *
 * Read-only, and deliberately so. Approval status, enrollment flags and lifecycle records
 * move when a regulator moves them; a console that could set them would let the catalog be
 * made to say anything, which is the opposite of what this endpoint is for.
 */
export const handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") throw Object.assign(new Error("method_not_allowed"), { statusCode: 405 });
    const staff = await requireStaff(event, ["owner", "administrator", "regulator_reviewer", "support"]);
    const truth = await buildCatalogTruth();

    /* A binding scoped to a state sees that state. A reviewer engaged for Michigan has no
       business reading Texas enrollment counts, and the summary is recounted from the rows
       actually returned so the headline cannot describe records the viewer cannot see.
       Rows with no state are withheld too: an unattributed row is not this reviewer's. */
    const scoped = staff.scopeStates
      ? { ...truth, rows: truth.rows.filter((row) => staff.scopeStates.includes(row.state)) }
      : truth;
    if (staff.scopeStates) {
      scoped.summary = {
        ...truth.summary,
        rows: scoped.rows.length,
        publiclyListed: scoped.rows.filter((row) => row.publicEntry).length,
        sellable: scoped.rows.filter((row) => row.payment).length,
        enrollmentEnabled: scoped.rows.filter((row) => row.payment?.enrollmentEnabled).length,
        approvedInEnvironment: scoped.rows.filter((row) => row.payment?.approvalStatus === "approved").length,
        rowsWithDiscrepancies: scoped.rows.filter((row) => row.discrepancies.length).length,
        discrepancyCounts: scoped.rows.flatMap((row) => row.discrepancies).reduce((counts, item) => {
          counts[item.code] = (counts[item.code] || 0) + 1;
          return counts;
        }, {}),
      };
    }

    await logConsoleAction(staff, "catalog.read", null, {
      rows: scoped.summary.rows,
      scopeStates: staff.scopeStates,
    });
    return sessionResponse(200, {
      viewer: { roles: staff.roles, scopeStates: staff.scopeStates },
      readOnly: true,
      ...scoped,
    }, staff.auth.refreshedSession ? sessionCookies(staff.auth.refreshedSession) : []);
  } catch (error) {
    const status = Number(error?.statusCode) || 500;
    if (status >= 500) console.error("Admin catalog endpoint error", error?.message);
    return sessionResponse(status, { error: status >= 500 ? "admin_catalog_unavailable" : error.message });
  }
};
