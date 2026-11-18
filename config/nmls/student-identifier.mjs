/* The learner's own NMLS Unique Identifier, held on the student profile.
 *
 * BioSig-ID's acceptance list (item 7, email of 2026-11-17) requires that a student can
 * correct this number themselves if they mistype it, and that it is visibly part of their
 * profile. This module is the one place that decides what counts as a well-formed entry.
 *
 * SCOPE OF THIS CHECK. It catches typing mistakes — letters, punctuation, an empty box, a
 * number of implausible length. It does NOT establish that the number belongs to the
 * person entering it. Only NMLS and the BioSig checkpoint can do that, and until the
 * NMLS-compliant endpoint is connected nothing here has been confirmed against a real
 * record.
 *
 * THE LENGTH BOUND IS PROVISIONAL. The authoritative format rule lives in the NMLS
 * Functional Specifications and the NMLS API documentation, both of which sit behind the
 * provider login and have NOT been read. 12 digits is a deliberately loose ceiling chosen
 * so that a genuine identifier is never rejected; it is not a rule taken from NMLS.
 * Replace it, and this comment, once the specifications have actually been read.
 */

/** Longest entry accepted. Provisional — see the file header. */
export const NMLS_ID_MAX_DIGITS = 12;

/** Separators a person may type or paste; removed before the number is judged. */
const SEPARATORS = /[\s ‑-―-]+/g;

const DIGITS_ONLY = new RegExp(`^[0-9]{1,${NMLS_ID_MAX_DIGITS}}$`);

/** Why an entry was refused. The portal maps these to sentences a learner can act on. */
export const NMLS_ID_REJECTIONS = Object.freeze({
  EMPTY: "nmls_id_empty",
  NOT_DIGITS: "nmls_id_not_digits",
  TOO_LONG: "nmls_id_too_long",
});

/**
 * Judge one entry.
 *
 * Returns `{ ok: true, value }` with the number reduced to digits, ready to store, or
 * `{ ok: false, reason }` naming one member of NMLS_ID_REJECTIONS. It never throws and
 * never partially accepts: an entry that is not stored is not altered either.
 */
export function readStudentNmlsId(raw) {
  if (typeof raw !== "string" && typeof raw !== "number") {
    return { ok: false, reason: NMLS_ID_REJECTIONS.EMPTY };
  }
  const stripped = String(raw).replace(SEPARATORS, "");
  if (stripped === "") return { ok: false, reason: NMLS_ID_REJECTIONS.EMPTY };
  if (!/^[0-9]+$/.test(stripped)) return { ok: false, reason: NMLS_ID_REJECTIONS.NOT_DIGITS };
  if (!DIGITS_ONLY.test(stripped)) return { ok: false, reason: NMLS_ID_REJECTIONS.TOO_LONG };
  return { ok: true, value: stripped };
}

/**
 * True when the stored column holds something this module would accept today.
 * Used to tell "never entered" apart from "entered under an older rule".
 */
export function isStoredNmlsIdWellFormed(stored) {
  return stored !== null && stored !== undefined && readStudentNmlsId(stored).ok;
}

/**
 * What the learner is shown about their own number.
 * `null` means they have not entered one; the portal then asks for it rather than
 * presenting an empty field as though it were a saved value.
 */
export function nmlsIdProfileState(stored) {
  const present = stored !== null && stored !== undefined && String(stored).trim() !== "";
  if (!present) return Object.freeze({ present: false, value: null, correctable: true });
  return Object.freeze({
    present: true,
    value: String(stored),
    // A stored number is always correctable: BioSig requires a self-service typo fix.
    correctable: true,
  });
}
