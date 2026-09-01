/**
 * CA-BLOCK-1 — Document Lab data model.
 *
 * The reusable definition shape for regulated-document walkthroughs: California contracts and
 * disclosures, the Loan Estimate, Closing Disclosure, URLA/1003, RESPA/TILA documents, and other
 * state forms in later phases. This phase ships the MODEL and its validator; no mortgage form is
 * populated into Assignment 1, because the Assignment 1 curriculum does not require one.
 *
 * THE FIXED-REGION RULE, ENFORCED. Every highlight region must be a human-authored, fixed
 * rectangle (percent coordinates), and every highlight must carry `regionAuthor: "human"` naming
 * review provenance. The validator REFUSES a definition whose regions are missing, out of range,
 * or marked as machine-derived — AI or automatic geometry may not guess where a regulated form's
 * fields are.
 */

export const DOCUMENT_LAB_SCHEMA = Object.freeze({
  document: ["documentId", "title", "source", "version", "effectiveDate", "pages"],
  page: ["page", "imagePath", "highlights"],
  highlight: [
    "highlightId", "region", "regionAuthor", "learningObjective", "explanation",
    "commonMistake", "relatedBlockId", "relatedRetrievalCheckId", "textEquivalent",
  ],
});

function validRegion(region) {
  if (!region || typeof region !== "object") return false;
  for (const key of ["x", "y", "w", "h"]) {
    const value = Number(region[key]);
    if (!Number.isFinite(value) || value < 0 || value > 100) return false;
  }
  return Number(region.w) > 0 && Number(region.h) > 0;
}

export function validateDocumentDefinition(doc) {
  const failures = [];
  for (const field of ["documentId", "title", "source", "version", "effectiveDate"]) {
    if (!doc?.[field]) failures.push(`missing ${field}`);
  }
  if (!Array.isArray(doc?.pages) || !doc.pages.length) failures.push("missing pages");
  for (const page of doc?.pages || []) {
    if (!Number.isInteger(page?.page) || page.page < 1) failures.push("page number invalid");
    for (const highlight of page?.highlights || []) {
      if (!highlight.highlightId) failures.push("highlight missing highlightId");
      if (!validRegion(highlight.region)) {
        failures.push(`${highlight.highlightId || "highlight"}: region must be a fixed rectangle in percent coordinates`);
      }
      if (highlight.regionAuthor !== "human") {
        failures.push(`${highlight.highlightId || "highlight"}: regions must be human-defined (regionAuthor: "human") — automatic geometry may not guess regulated-form fields`);
      }
      for (const field of ["learningObjective", "explanation", "textEquivalent"]) {
        if (!highlight[field]) failures.push(`${highlight.highlightId || "highlight"}: missing ${field}`);
      }
    }
  }
  return { valid: failures.length === 0, failures };
}

/* The registry ships empty in this phase: the component and model exist; the forms arrive with
   the phases whose curriculum actually teaches them. */
export const DOCUMENT_LAB_REGISTRY = Object.freeze([]);

export default Object.freeze({ DOCUMENT_LAB_SCHEMA, validateDocumentDefinition, DOCUMENT_LAB_REGISTRY });
