/**
 * Texas courses — reviewed dispositions for quotations the mechanical audit cannot match.
 *
 * WHY THIS FILE REPLACES A NUMBER. The Principles II acceptance report gated point 7 on
 * "actionableQuotes.length <= 2". That 2 was not derived from anything; it was the count the
 * then-current matcher happened to produce, and it silently encoded the matcher's defects as a
 * standard. When the matcher was repaired and its coverage widened — 1,048 quotations checked
 * became 1,162 — the count moved to 8 and the course failed a gate it had passed for no better
 * reason than that a tool had improved. A threshold fitted to a broken instrument is not a
 * standard, so it is gone.
 *
 * WHAT REPLACES IT. Every quotation the audit cannot match must have a disposition recorded here,
 * and none of them may be a sourcing defect. That is a real requirement: it permits zero unexplained
 * unmatched quotations rather than an arbitrary handful, and it cannot be satisfied by a tool
 * getting worse.
 *
 * THE IDS ARE STABLE. Each key is sha256(moduleId + "|" + quotation), truncated, computed by the
 * audit engine. It survives a re-run and an edit elsewhere in the same file. If a quotation is
 * rewritten its id changes, the disposition is orphaned, and the gate fails until the new id is
 * reviewed — which is the behaviour we want.
 *
 * A DISPOSITION IS A REVIEW FINDING, NOT A SUPPRESSION. Recording one asserts that a person or
 * agent looked at the quotation against the held source and reached the stated conclusion. Nothing
 * here is a pattern-based exemption, and no disposition may be added to make a gate pass.
 */

/** The only dispositions that exist. Anything else fails at load. */
export const DISPOSITIONS = Object.freeze({
  /* Quoted speech invented for a fact pattern. It asserts no source and belongs to no statute; the
     matcher sees quotation marks near a citation and cannot know the difference. */
  INVENTED_DIALOGUE: "quoted speech in a teaching fact pattern; asserts no source",
  /* The source's own layout puts the quoted words in separate table cells or columns, so they are
     never contiguous in the extracted text even though a reader sees them as one phrase. */
  FORM_FIELD_LABEL_NOT_CONTIGUOUS: "field labels from a form whose layout separates them in the source text",
  /* A bracketed alteration signalled in the ordinary way, e.g. "provide[]" for "provides" to fit the
     carrying sentence's grammar. Correct practice; unmatched because the brackets change the string. */
  BRACKETED_ALTERATION: "a signalled bracketed alteration; verbatim apart from the marked change",
  /* An ellipsis elides intervening words. Both flanks verify; the elision is disclosed. */
  ELLIPSIS_DISCLOSED: "an ellipsis discloses elided words; the quoted flanks verify against the source",
  /* An ellipsis elides a cross-reference to an exception. Disclosed, so not concealment, but the
     quotation would read better with the qualifier and is a candidate for the next revision. */
  ELLIPSIS_ELIDES_CROSS_REFERENCE: "disclosed ellipsis that drops a cross-reference to an exception; improve at next revision",
  /* Minor punctuation inside a quotation differs from the source, e.g. a dropped colon. Disclosed
     here rather than left to look like an unverified quotation. */
  PUNCTUATION_DEVIATION: "quoted words verify; interior punctuation differs from the source",
  /* The source is held but this engine cannot read it — the six TREC PDFs have no text extractor
     available here. A tool coverage limit, recorded as one. */
  SOURCE_HELD_BUT_NOT_MACHINE_READABLE: "the source is held as a PDF the audit engine cannot extract",
  /* The real thing: a quotation attributed to a source that does not contain it. Any of these fails
     the acceptance gate. */
  SOURCING_DEFECT: "attributed to a source that does not carry the words; must be fixed",
});

export const SOURCING_DEFECT = "SOURCING_DEFECT";

const record = (disposition, module, reason) => Object.freeze({ disposition, module, reason });

/**
 * Principles of Real Estate II — reviewed 2026-08-30 against the held sources, after the matcher
 * repair widened coverage from 1,048 to 1,162 checked quotations. Eight unmatched, none a defect.
 */
const PRINCIPLES_II = Object.freeze({
  cb804a77811a: record("BRACKETED_ALTERATION", "module-02",
    "Texas Constitution art. XVI § 50(a)(5)(C) reads 'expressly provides'; the module writes 'expressly provide[]' so the words fit its carrying sentence 'the contract must'. The brackets signal the alteration in the ordinary way and the rest is verbatim."),
  "699067b9881a": record("FORM_FIELD_LABEL_NOT_CONTIGUOUS", "module-05",
    "Field labels from the Property Code § 5.008 seller's disclosure form. The held source lays the form out in two columns, so these words are never contiguous in the extracted text even though the printed notice reads them as one line."),
  a11eb86c6dd4: record("FORM_FIELD_LABEL_NOT_CONTIGUOUS", "module-05",
    "Same § 5.008 form-layout cause as 699067b9881a — the methamphetamine line is interleaved with the adjacent column in the held HTML."),
  "8fe65d19c4fe": record("PUNCTUATION_DEVIATION", "module-06",
    "Occupations Code § 1101.155(b) reads 'a contract form that is: (1) prepared by the property owner'. The module drops the colon after 'is'. Every quoted word verifies; only the interior punctuation differs, and the ellipsis correctly discloses the elided 'for the sale, exchange, option, or lease of an interest in real property'."),
  a1de68d9ed84: record("INVENTED_DIALOGUE", "module-07",
    "A seller's line in a DTPA fact pattern. Asserts no source."),
  "7cab6ee1ec2a": record("INVENTED_DIALOGUE", "module-07",
    "A seller's answer in a misrepresentation fact pattern. Asserts no source."),
  "942e2915d797": record("ELLIPSIS_ELIDES_CROSS_REFERENCE", "module-08",
    "42 U.S.C. § 3610(g)(2)(A) reads 'the Secretary shall, except as provided in subparagraph (C), immediately issue a charge on behalf of the aggrieved person'. The module's ellipsis elides the subparagraph (C) cross-reference. The elision is disclosed and both flanks verify, but the exception should be carried at the next content revision."),
  f4cdc184652c: record("INVENTED_DIALOGUE", "module-08",
    "A blockbusting solicitation invented to illustrate 42 U.S.C. § 3604(e). Asserts no source; it is the conduct the section prohibits, not the section's words."),
});

export const BY_COURSE = Object.freeze({
  "tx-principles-real-estate-ii-30-v1": PRINCIPLES_II,
});

/**
 * Reconcile a course's unmatched quotations against the recorded dispositions.
 * @param {string} courseId
 * @param {Array<{id: string, module: string, quote: string}>} unmatched  audit.quoteFailures
 */
export function reconcile(courseId, unmatched) {
  const recorded = BY_COURSE[courseId] || {};
  const undispositioned = unmatched.filter((q) => !recorded[q.id]);
  const defects = unmatched.filter((q) => recorded[q.id]?.disposition === SOURCING_DEFECT);
  const orphaned = Object.keys(recorded).filter((id) => !unmatched.some((q) => q.id === id));
  const byDisposition = {};
  for (const q of unmatched) {
    const d = recorded[q.id]?.disposition ?? "UNDISPOSITIONED";
    byDisposition[d] = (byDisposition[d] || 0) + 1;
  }
  return Object.freeze({
    courseId,
    unmatched: unmatched.length,
    undispositioned,
    defects,
    /* A disposition whose quotation no longer exists. Not a failure — a quotation may have been
       rewritten or removed — but it must not sit unnoticed, because a stale disposition is how an
       exemption outlives the thing it explained. */
    orphaned,
    byDisposition,
    clean: undispositioned.length === 0 && defects.length === 0,
  });
}

/* ── load-time invariants ───────────────────────────────────────────────────────────────────── */
for (const [courseId, records] of Object.entries(BY_COURSE)) {
  for (const [id, r] of Object.entries(records)) {
    if (!DISPOSITIONS[r.disposition]) {
      throw new Error(`quotation-dispositions: ${courseId}/${id} uses unknown disposition ${r.disposition}`);
    }
    if (!r.reason || r.reason.length < 40) {
      throw new Error(`quotation-dispositions: ${courseId}/${id} has no substantive reason recorded`);
    }
    if (!/^[0-9a-f]{12}$/.test(id)) {
      throw new Error(`quotation-dispositions: ${courseId}/${id} is not a 12-hex audit id`);
    }
  }
}

export default { DISPOSITIONS, BY_COURSE, reconcile };
