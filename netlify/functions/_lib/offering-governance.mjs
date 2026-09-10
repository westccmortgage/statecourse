import { dbRequest } from "./db.mjs";
import { logConsoleAction } from "./staff-session.mjs";

/*
 * May this offering be charged for, and what may it be called.
 *
 * Both questions are answered per site, per state, per discipline, per offering, because
 * approving one thing must not switch on another. The database refuses a live payment mode
 * without a named approval; this file refuses to set live unless the caller is the owner.
 * Neither check is a substitute for the other: the first survives a bug here, the second
 * catches what a constraint cannot see.
 */

const STATE = /^[A-Z]{2}$/;
const DISCIPLINES = Object.freeze(["real_estate", "mortgage"]);
const PAYMENT_MODES = Object.freeze(["disabled", "sandbox", "live"]);
const APPROVAL_STATUSES = Object.freeze(["none", "submitted", "approved", "withdrawn", "expired"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function fail(message, statusCode = 400) {
  throw Object.assign(new Error(message), { statusCode });
}

export function defaultSite() {
  const base = String(process.env.STATECOURSE_BASE_URL || "").trim();
  if (!base) fail("statecourse_base_url_not_configured", 503);
  return new URL(base).hostname.toLowerCase().replace(/^www\./, "");
}

/*
 * The governing row for one offering, or the closed default.
 *
 * An offering nobody has recorded anything about is training-only with payments disabled.
 * That is the safe reading and it is also the true one: silence is not approval.
 */
export async function governanceFor(offeringId, { site = null } = {}) {
  const host = site || defaultSite();
  let row = null;
  try {
    const rows = await dbRequest(
      `offering_public_status?site=eq.${encodeURIComponent(host)}`
        + `&offering_id=eq.${encodeURIComponent(offeringId)}&limit=1`,
    );
    row = rows?.[0] || null;
  } catch (error) {
    /*
     * Fail closed, and deliberately not by throwing.
     *
     * If this view cannot be read — the migration has not run yet, the database is
     * briefly unreachable — the safe answer is the same as the answer for an offering
     * nobody has recorded: training only, payments disabled. Throwing would have made an
     * unreachable governance record break checkout loudly; returning the closed default
     * makes it refuse quietly, which is the direction an error here should fall. It also
     * means the code can be deployed before the migration without a window in which
     * anything is chargeable.
     */
    console.error("Offering governance unreadable; treating as unrecorded", offeringId, error?.message);
    return {
      site: host,
      offering_id: offeringId,
      approval_status: "none",
      training_access_enabled: false,
      payment_mode: "disabled",
      approval_currently_effective: false,
      representation: "training_only",
      live_charging_permitted: false,
      unrecorded: true,
      unreadable: true,
    };
  }
  if (row) return row;
  return {
    site: host,
    offering_id: offeringId,
    approval_status: "none",
    training_access_enabled: false,
    payment_mode: "disabled",
    approval_currently_effective: false,
    representation: "training_only",
    live_charging_permitted: false,
    unrecorded: true,
  };
}

export async function governanceCatalogue({ site = null } = {}) {
  const host = site || defaultSite();
  return (await dbRequest(
    `offering_public_status?site=eq.${encodeURIComponent(host)}&order=state.asc,discipline.asc,offering_id.asc`,
  )) || [];
}

/*
 * What the site is permitted to say.
 *
 * Returned by the server rather than chosen by the page, so the words cannot drift from
 * the record. An offering whose approval lapsed yesterday describes itself as training
 * today without anyone editing a template.
 */
export function representationCopy(status) {
  if (status?.representation === "approved") {
    return {
      representation: "approved",
      badge: "Approved",
      statement: `Approved by ${status.approval_authority} under ${status.approval_number}.`,
      mayClaimCredit: true,
    };
  }
  return {
    representation: "training_only",
    badge: "Training purposes",
    /* Deliberately explicit about the two things it is not. */
    statement: "Offered for training purposes. This offering is not approved licensing or "
      + "continuing education, and completing it does not earn license credit.",
    mayClaimCredit: false,
  };
}

/*
 * Record a governance decision.
 *
 * `live` is the only value gated on who is asking, and it is gated here because the
 * database cannot see a session. Everything else an administrator may set; nothing an
 * administrator sets can start charging, because starting to charge is one specific value
 * of one specific field and the owner is the only one who can write it.
 */
export async function recordGovernance({ staff, input }) {
  const isOwner = staff.roles.includes("owner");
  const site = String(input.site || defaultSite()).trim().toLowerCase();
  const state = String(input.state || "").trim().toUpperCase();
  const discipline = String(input.discipline || "").trim();
  const offeringKind = String(input.offeringKind || "course").trim();
  const offeringId = String(input.offeringId || "").trim();
  const paymentMode = String(input.paymentMode || "disabled").trim();
  const approvalStatus = String(input.approvalStatus || "none").trim();
  const note = String(input.note || "").trim();

  if (!STATE.test(state)) fail("invalid_state");
  if (!DISCIPLINES.includes(discipline)) fail("invalid_discipline");
  if (!["course", "package"].includes(offeringKind)) fail("invalid_offering_kind");
  if (!offeringId) fail("invalid_offering_id");
  if (!PAYMENT_MODES.includes(paymentMode)) fail("invalid_payment_mode");
  if (!APPROVAL_STATUSES.includes(approvalStatus)) fail("invalid_approval_status");
  if (note.length < 10) fail("governance_note_required");

  /* A state-scoped administrator governs their own state and no other. */
  if (staff.scopeStates && !staff.scopeStates.includes(state)) fail("state_outside_staff_scope", 403);

  if (paymentMode === "live" && !isOwner) {
    throw Object.assign(new Error("live_payments_are_owner_only"), {
      statusCode: 403,
      detail: { yourRoles: staff.roles, required: "owner" },
    });
  }

  const authority = String(input.approvalAuthority || "").trim() || null;
  const number = String(input.approvalNumber || "").trim() || null;
  const effective = String(input.approvalEffectiveDate || "").trim() || null;
  const expires = String(input.approvalExpiresDate || "").trim() || null;
  for (const [value, name] of [[effective, "approval_effective_date"], [expires, "approval_expires_date"]]) {
    if (value && !ISO_DATE.test(value)) fail(`invalid_${name}`);
  }
  if (approvalStatus === "approved" && (!authority || !number)) {
    fail("approved_status_requires_authority_and_number");
  }
  if (paymentMode === "live" && (approvalStatus !== "approved" || !effective)) {
    fail("live_requires_a_currently_recorded_approval");
  }

  const evidence = input.approvalEvidence && typeof input.approvalEvidence === "object"
    ? input.approvalEvidence
    : {};

  await dbRequest("offering_governance_events", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      site,
      state,
      discipline,
      offering_kind: offeringKind,
      offering_id: offeringId,
      approval_status: approvalStatus,
      approval_authority: authority,
      approval_number: number,
      approval_effective_date: effective,
      approval_expires_date: expires,
      approval_evidence: evidence,
      training_access_enabled: input.trainingAccessEnabled === true,
      payment_mode: paymentMode,
      recorded_by: staff.auth.student.id,
      recorded_role: isOwner ? "owner" : staff.actorRole,
      note,
    },
  });
  await logConsoleAction(staff, "governance.record", offeringId, {
    site, state, discipline, approvalStatus, paymentMode,
    trainingAccessEnabled: input.trainingAccessEnabled === true,
  });

  const status = await governanceFor(offeringId, { site });
  return { offeringId, status, copy: representationCopy(status) };
}

/*
 * The gate every money path must pass through.
 *
 * Kept as one function so there is one answer to "may we charge for this", and so a new
 * checkout surface cannot accidentally have its own opinion.
 */
export async function assertChargeable(offeringId, mode, { site = null } = {}) {
  const status = await governanceFor(offeringId, { site });
  if (mode === "live") {
    if (!status.live_charging_permitted) {
      throw Object.assign(new Error("live_charging_not_permitted_for_this_offering"), {
        statusCode: 403,
        detail: {
          offeringId,
          approvalStatus: status.approval_status,
          paymentMode: status.payment_mode,
          approvalCurrentlyEffective: status.approval_currently_effective === true,
        },
      });
    }
    return status;
  }
  /*
   * Sandbox accepts an offering set to either sandbox or live.
   *
   * STRIPE_MODE decides whether money is real; payment_mode decides whether this offering
   * may transact at all. Refusing a live offering while STRIPE_MODE is test would mean an
   * approved offering could not be rehearsed before going live, which is exactly when
   * rehearsal matters. Nothing is charged either way: test mode uses test credentials.
   */
  if (!["sandbox", "live"].includes(status.payment_mode)) {
    throw Object.assign(new Error("checkout_not_enabled_for_this_offering"), {
      statusCode: 403,
      detail: { offeringId, paymentMode: status.payment_mode },
    });
  }
  return status;
}

export const GOVERNANCE_VOCABULARY = Object.freeze({
  disciplines: DISCIPLINES,
  paymentModes: PAYMENT_MODES,
  approvalStatuses: APPROVAL_STATUSES,
});
