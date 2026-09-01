/**
 * TX Law of Agency — mechanical claim-to-source audit.
 *
 * Same engine as Principles I and II (scripts/lib/tx-claim-audit.mjs), pointed at this course's
 * curriculum. Sharing the engine rather than copying it is deliberate: three citation-level errors
 * have now been caught by enumeration across the Texas build — Finance Code § 343.102's expiry note
 * attributed to § 343.101, § 1101.652's subdivision (34) cited to subsection (a) rather than (b),
 * and 22 TAC § 535.191's penalty bands misassigned for subdivisions (b)(30) and (b)(31) — and each
 * was found by a check that every course should get, not one course.
 *
 * Usage: node scripts/audit-loa-claims.mjs
 * Exit status is non-zero if any citation resolves to a section not present in a held source.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runClaimAudit } from "./lib/tx-claim-audit.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = "texas/tx-law-of-agency-30-v1";

const { failures } = runClaimAudit({
  root,
  curriculumDir: path.join(root, HOME, "curriculum"),
  outPath: path.join(root, HOME, "claim-audit.json"),
  generatedBy: "scripts/audit-loa-claims.mjs",
  generatedFor: "Texas Law of Agency",
});

process.exitCode = failures.length ? 1 : 0;
