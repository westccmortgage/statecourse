/* Storing and correcting the learner's own NMLS Unique Identifier.
 *
 * BioSig-ID acceptance item 7 requires a self-service typo fix. The number is part of an
 * identity record, so it is never written from the browser: the caller establishes the
 * student from the session, and the write itself happens inside one database transaction
 * that also appends the change to an immutable log.
 */

import { rpc, dbRequest } from "./db.mjs";
import {
  readStudentNmlsId,
  nmlsIdProfileState,
  NMLS_ID_REJECTIONS,
} from "../../../config/nmls/student-identifier.mjs";

/* A refused entry is the learner's mistake, not a server fault: 400, with a code the
 * portal turns into a sentence. Reusing the validator's own codes keeps one vocabulary. */
const REJECTION_STATUS = 400;

function refuse(reason) {
  throw Object.assign(new Error(reason), { statusCode: REJECTION_STATUS });
}

/**
 * Record a learner's NMLS identifier, or correct one already stored.
 *
 * `studentId` must come from the verified session, never from the request body.
 * Returns `{ changed, nmlsId }`. Re-submitting the same number is not an error and is
 * not logged: a correction that corrects nothing is not a change.
 */
export async function saveStudentNmlsId(studentId, raw, { source = "student_portal" } = {}) {
  if (typeof studentId !== "string" || studentId === "") {
    throw Object.assign(new Error("invalid_student_session"), { statusCode: 401 });
  }
  const judged = readStudentNmlsId(raw);
  if (!judged.ok) refuse(judged.reason);

  let result;
  try {
    result = await rpc("set_student_nmls_id", {
      p_student: studentId,
      p_value: judged.value,
      p_source: source,
    });
  } catch (error) {
    /* The database repeats the same format rule. If it refuses where the validator
     * accepted, the two have drifted apart and that is a defect worth surfacing, not a
     * message to dress up as the learner's mistake. */
    const detail = String(error?.message || "");
    if (detail.includes("nmls_id_invalid")) {
      throw Object.assign(
        new Error("nmls_id_rule_mismatch"),
        { statusCode: 500, cause: error },
      );
    }
    throw error;
  }

  const row = Array.isArray(result) ? result[0] : result;
  return {
    changed: Boolean(row?.changed),
    nmlsId: typeof row?.nmls_id === "string" ? row.nmls_id : judged.value,
  };
}

/**
 * What the portal should show the learner about their number.
 * Reads the stored column rather than any browser-supplied value.
 */
export async function readStudentNmlsProfile(studentId) {
  const rows = await dbRequest(
    `students?id=eq.${encodeURIComponent(studentId)}&select=nmls_id&limit=1`,
  );
  return nmlsIdProfileState(rows?.[0]?.nmls_id ?? null);
}

export { NMLS_ID_REJECTIONS };
