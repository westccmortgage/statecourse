import { createHash } from "node:crypto";

const hash = value => createHash("sha256").update(value).digest("hex");
const normalize = value => value.replace(/\s+/g, " ").toLowerCase();

// Shared by the actual package verifier and mutation tests. Metadata alone cannot pass.
export function inspectIllinoisCapture(capture, { bytes, extracted, source } = {}) {
  const errors = [];
  if (!capture || !source) return ["Missing capture or source record"];
  if (capture.id !== source.id || capture.url !== source.url) errors.push("Source ID or URL mismatch");
  try {
    const expected = new URL(source.url);
    const final = new URL(capture.finalUrl);
    if (final.protocol !== "https:" || final.hostname !== expected.hostname) errors.push("Unapproved final URL");
  } catch { errors.push("Invalid source or final URL"); }
  if (capture.httpStatus !== 200) errors.push("Retrieval did not succeed");
  if (!bytes) errors.push("Missing source bytes");
  else {
    if (hash(bytes) !== capture.sha256) errors.push("Source SHA-256 mismatch");
    if (bytes.length !== capture.byteCount) errors.push("Source byte count mismatch");
  }
  if (typeof extracted !== "string") errors.push("Missing extracted text");
  else {
    if (hash(extracted) !== capture.textSha256) errors.push("Extracted text SHA-256 mismatch");
    if (!capture.contentMarkers?.length) errors.push("Missing identity markers");
    for (const marker of capture.contentMarkers || []) {
      if (!normalize(extracted).includes(normalize(marker))) errors.push(`Identity marker absent: ${marker}`);
    }
  }
  const expectsPdf = /\.pdf$/i.test(new URL(source.url).pathname) || capture.pageCount !== null;
  if (expectsPdf) {
    if (!/^application\/pdf(?:;|$)/i.test(capture.contentType || "")) errors.push("Response type is not PDF");
    if (bytes?.subarray(0, 5).toString() !== "%PDF-") errors.push("PDF signature missing");
    if (!Number.isInteger(capture.pageCount) || capture.pageCount < 1) errors.push("Invalid PDF page count");
    if (typeof extracted === "string" && (extracted.match(/^PAGE \d+$/gm) || []).length !== capture.pageCount) errors.push("Extracted page count mismatch");
  }
  return errors;
}
